import { withCorsHeaders, preflight } from './cors';

declare const caches: CacheStorage & { default: Cache };

const encoder = new TextEncoder();

type JwtHeader = {
	alg: string;
	kid: string;
};

type JwtPayload = {
	iss: string;
	aud: string | string[];
	sub: string;
	email?: string;
	exp: number;
	nbf?: number;
	iat?: number;
	[key: string]: unknown;
};

type Jwk = {
	kid: string;
	kty: string;
	alg?: string;
	use?: string;
	n?: string;
	e?: string;
};

interface ClerkUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	imageUrl?: string;
}

interface WorkerContext {
	waitUntil(promise: Promise<unknown>): void;
}

interface Env {
	CLERK_JWKS_URL: string;
	CLERK_ISSUER: string;
	CLERK_AUDIENCE: string;
	MATTERMOST_BASE_URL: string;
	MATTERMOST_ADMIN_TOKEN: string;
	MATTERMOST_TEAM_ID: string;
	MATTERMOST_DEFAULT_CHANNEL_ID?: string;
	SESSION_COOKIE_DOMAIN: string;
	SESSION_COOKIE_SECURE?: string;
	SESSION_TTL_SECONDS?: string;
	SESSION_COOKIE_NAME?: string;
	SENTRY_DSN?: string;
}

const SESSION_COOKIE_DEFAULT = 'MMSESSION';
const SESSION_COOKIE_PATH = '/';

const notFound = () => new Response('Not found', { status: 404 });

export default {
	async fetch(request: Request, env: Env, ctx: WorkerContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return preflight({ allowOrigin: getAllowedOrigin(request), allowCredentials: true });
		}

		try {
			const url = new URL(request.url);
			if (url.pathname === '/exchange' && request.method === 'POST') {
				return await handleExchange(request, env, ctx);
			}
			if (url.pathname === '/refresh' && request.method === 'POST') {
				return await handleRefresh(request, env);
			}
			if (url.pathname === '/logout' && request.method === 'POST') {
				return await handleLogout(request, env);
			}
			return withCorsHeaders(notFound(), { allowOrigin: getAllowedOrigin(request) });
		} catch (error) {
			return await reportError(env, error);
		}
	},
};

async function handleExchange(request: Request, env: Env, ctx: WorkerContext): Promise<Response> {
	const { token } = (await safeJson(request)) as { token?: string };
	if (!token) {
		return errorResponse('token is required', 400, request);
	}

	const payload = await verifyClerkToken(token, env);
	const user = await ensureMattermostUser(payload, env);
	const session = await createMattermostSession(user.id, env);
	if (!session.token) {
		throw new Error('Mattermost session missing token');
	}

	const cookie = buildSessionCookie(session.token, env, session.expires_at);
	const responseBody = {
		ok: true,
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
		},
		expiresAt: session.expires_at,
	};

	const response = new Response(JSON.stringify(responseBody), {
		headers: buildJsonHeaders(cookie, request),
	});

	ctx.waitUntil(trackEvent(env, 'mm-auth.exchange.success', { userId: user.id }));
	return response;
}

async function handleRefresh(request: Request, env: Env): Promise<Response> {
	const sessionToken = getSessionCookie(request, env);
	if (!sessionToken) {
		return errorResponse('No session cookie', 401, request);
	}
	const me = await mattermostFetch(env, '/api/v4/users/me', { sessionToken });
	if (!me.ok) {
		return errorResponse('Session invalid', 401, request, me.status);
	}
	const body = await me.json();
	return withCorsHeaders(
		new Response(JSON.stringify({ ok: true, user: body }), { headers: buildJsonHeaders(undefined, request) }),
		{ allowOrigin: getAllowedOrigin(request), allowCredentials: true },
	);
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
	const sessionToken = getSessionCookie(request, env);
	if (sessionToken) {
		await mattermostFetch(env, '/api/v4/users/logout', {
			method: 'POST',
			sessionToken,
		});
	}
	const expiredCookie = buildSessionCookie('', env, 0, true);
	return withCorsHeaders(new Response(JSON.stringify({ ok: true }), { headers: buildJsonHeaders(expiredCookie, request) }), {
		allowOrigin: getAllowedOrigin(request),
		allowCredentials: true,
	});
}

async function verifyClerkToken(token: string, env: Env): Promise<JwtPayload> {
	const [headerSegment, payloadSegment, signatureSegment] = token.split('.');
	if (!headerSegment || !payloadSegment || !signatureSegment) {
		throw new Error('Invalid token structure');
	}
		const header = parseJson<JwtHeader>(decodeBase64Url(headerSegment));
		const payload = parseJson<JwtPayload>(decodeBase64Url(payloadSegment));

	if (!header.kid) {
		throw new Error('Token missing kid');
	}

	const jwk = await findJwk(header.kid, env.CLERK_JWKS_URL);
		const data = encoder.encode(`${headerSegment}.${payloadSegment}`);
		const signature = decodeBase64UrlToUint8(signatureSegment);

		const key = await crypto.subtle.importKey('jwk', jwkToVerifyKey(jwk), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, [
		'verify',
	]);
				const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature.buffer as ArrayBuffer, data);

	if (!valid) {
		throw new Error('Token signature invalid');
	}

	if (payload.iss !== env.CLERK_ISSUER) {
		throw new Error('Token issuer mismatch');
	}

	const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
	if (!audiences.includes(env.CLERK_AUDIENCE)) {
		throw new Error('Token audience mismatch');
	}

	const now = Math.floor(Date.now() / 1000);
	if (payload.exp <= now) {
		throw new Error('Token expired');
	}
	if (payload.nbf && payload.nbf > now) {
		throw new Error('Token not yet valid');
	}

	return payload;
}

async function findJwk(kid: string, jwksUrl: string): Promise<Jwk> {
	const cacheKey = `jwks:${jwksUrl}`;
		const cached = await caches.default.match(cacheKey);
	let body: { keys: Jwk[] };
	if (cached) {
		body = await cached.json();
	} else {
		const response = await fetch(jwksUrl);
		if (!response.ok) {
			throw new Error(`Unable to fetch Clerk JWKS (${response.status})`);
		}
		body = await response.json();
		await caches.default.put(cacheKey, new Response(JSON.stringify(body), { headers: { 'cache-control': 'max-age=3600' } }));
	}
	const jwk = body.keys.find((key) => key.kid === kid);
	if (!jwk) {
		throw new Error(`JWKS missing key ${kid}`);
	}
	return jwk;
}

async function ensureMattermostUser(payload: JwtPayload, env: Env) {
	const email = (payload.email ?? payload['email_address']) as string | undefined;
	if (!email) {
		throw new Error('Token missing email');
	}

	const username = buildUsername(email, payload.sub);
	const first_name = (payload['given_name'] as string | undefined) ?? '';
	const last_name = (payload['family_name'] as string | undefined) ?? '';

	const existing = await mattermostFetch(env, `/api/v4/users/email/${encodeURIComponent(email)}`);
	let user: any;
	if (existing.ok) {
		user = await existing.json();
		const authPatch = {
			auth_service: 'oidc',
			auth_data: payload.sub,
			first_name,
			last_name,
		};
		await mattermostFetch(env, `/api/v4/users/${user.id}/patch`, {
			method: 'PUT',
			body: JSON.stringify(authPatch),
			headers: { 'Content-Type': 'application/json' },
		});
	} else if (existing.status === 404) {
		const createResponse = await mattermostFetch(env, '/api/v4/users', {
			method: 'POST',
			body: JSON.stringify({
				email,
				username,
				first_name,
				last_name,
				auth_service: 'oidc',
				auth_data: payload.sub,
				nickname: username,
				locale: 'en',
				password: crypto.randomUUID(),
			}),
			headers: { 'Content-Type': 'application/json' },
		});
		if (!createResponse.ok) {
			const text = await createResponse.text();
			throw new Error(`Unable to create Mattermost user: ${createResponse.status} ${text}`);
		}
		user = await createResponse.json();
	} else {
		const text = await existing.text();
		throw new Error(`Mattermost user lookup failed: ${existing.status} ${text}`);
	}

	await ensureTeamMembership(env, user.id);
	if (env.MATTERMOST_DEFAULT_CHANNEL_ID) {
		await ensureChannelMembership(env, env.MATTERMOST_DEFAULT_CHANNEL_ID, user.id);
	}

	return user;
}

async function ensureTeamMembership(env: Env, userId: string) {
	const membership = await mattermostFetch(
		env,
		`/api/v4/users/${encodeURIComponent(userId)}/teams`);
	if (membership.ok) {
		const teams = await membership.json();
		if (Array.isArray(teams) && teams.some((item) => item.id === env.MATTERMOST_TEAM_ID)) {
			return;
		}
	}
	await mattermostFetch(env, `/api/v4/teams/${env.MATTERMOST_TEAM_ID}/members`, {
		method: 'POST',
		body: JSON.stringify({ team_id: env.MATTERMOST_TEAM_ID, user_id: userId }),
		headers: { 'Content-Type': 'application/json' },
	});
}

async function ensureChannelMembership(env: Env, channelId: string, userId: string) {
	const response = await mattermostFetch(env, `/api/v4/channels/${channelId}/members/${userId}`);
	if (response.ok) {
		return;
	}
	await mattermostFetch(env, `/api/v4/channels/${channelId}/members`, {
		method: 'POST',
		body: JSON.stringify({ user_id: userId }),
		headers: { 'Content-Type': 'application/json' },
	});
}

async function createMattermostSession(userId: string, env: Env) {
	const response = await mattermostFetch(env, `/api/v4/users/${userId}/sessions`, {
		method: 'POST',
		body: JSON.stringify({
			device_id: 'clerk-sso',
		}),
		headers: { 'Content-Type': 'application/json' },
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Failed to create Mattermost session: ${response.status} ${text}`);
	}
	return response.json();
}

async function mattermostFetch(env: Env, path: string, options: RequestInit & { sessionToken?: string } = {}): Promise<Response> {
	const url = new URL(path, env.MATTERMOST_BASE_URL);
	const headers = new Headers(options.headers);
	if (options.sessionToken) {
		headers.set('Authorization', `Bearer ${options.sessionToken}`);
	} else {
		headers.set('Authorization', `Bearer ${env.MATTERMOST_ADMIN_TOKEN}`);
	}
	if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
		headers.set('Content-Type', 'application/json');
	}
	return fetch(url.toString(), {
		...options,
		headers,
	});
}

function buildSessionCookie(token: string, env: Env, expiresAt?: number, expireNow = false): string {
	const name = env.SESSION_COOKIE_NAME ?? SESSION_COOKIE_DEFAULT;
	const secure = (env.SESSION_COOKIE_SECURE ?? 'true') !== 'false';
	const ttlSecondsRaw = env.SESSION_TTL_SECONDS ? Number(env.SESSION_TTL_SECONDS) : 86400;
	const ttlSeconds = Number.isFinite(ttlSecondsRaw) ? ttlSecondsRaw : 86400;
	const expires = expireNow ? new Date(0) : expiresAt ? new Date(expiresAt * 1000) : new Date(Date.now() + ttlSeconds * 1000);
	const directives = [
		`${name}=${token}`,
		`Path=${SESSION_COOKIE_PATH}`,
		`Domain=${env.SESSION_COOKIE_DOMAIN}`,
		`Expires=${expires.toUTCString()}`,
		`SameSite=None`,
		'HttpOnly',
	];
	if (secure) {
		directives.push('Secure');
	}
	if (expireNow) {
		directives.push('Max-Age=0');
	} else {
		directives.push(`Max-Age=${ttlSeconds}`);
	}
	return directives.join('; ');
}

function buildJsonHeaders(cookie: string | undefined, request: Request): HeadersInit {
	const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
	headers.set('access-control-allow-origin', getAllowedOrigin(request));
	headers.set('access-control-allow-credentials', 'true');
	if (cookie) {
		headers.append('set-cookie', cookie);
	}
	return headers;
}

function getAllowedOrigin(request: Request): string {
	const origin = request.headers.get('origin');
	return origin ?? '*';
}

function getSessionCookie(request: Request, env: Env): string | undefined {
	const name = env.SESSION_COOKIE_NAME ?? SESSION_COOKIE_DEFAULT;
	const cookie = request.headers.get('cookie');
	if (!cookie) return undefined;
	const pairs = cookie.split(';').map((part) => part.trim());
	for (const pair of pairs) {
		if (pair.startsWith(`${name}=`)) {
			return pair.slice(name.length + 1);
		}
	}
	return undefined;
}

async function safeJson<T = any>(request: Request): Promise<T> {
	const text = await request.text();
	if (!text) {
		return {} as T;
	}
	return JSON.parse(text);
}

function decodeBase64Url(value: string): string {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
	return atob(padded);
}

function parseJson<T>(input: string): T {
	return JSON.parse(input) as T;
}

function decodeBase64UrlToUint8(value: string): Uint8Array {
	const decoded = decodeBase64Url(value);
	const bytes = new Uint8Array(decoded.length);
	for (let i = 0; i < decoded.length; i += 1) {
		bytes[i] = decoded.charCodeAt(i);
	}
	return bytes;
}

function jwkToVerifyKey(jwk: Jwk) {
	if (!jwk.n || !jwk.e) {
		throw new Error('JWKS entry missing modulus or exponent');
	}
	return {
		...jwk,
		key_ops: ['verify'],
		ext: true,
	};
}

function buildUsername(email: string, sub: string): string {
	const local = email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
	const suffix = sub.slice(-6).replace(/[^a-z0-9]/gi, '').toLowerCase();
	return `${local}_${suffix}`.replace(/_+/g, '_');
}

async function errorResponse(message: string, status: number, request: Request, upstreamStatus?: number): Promise<Response> {
	const body = JSON.stringify({ ok: false, error: message, upstreamStatus });
	return withCorsHeaders(new Response(body, { status, headers: buildJsonHeaders(undefined, request) }), {
		allowOrigin: getAllowedOrigin(request),
		allowCredentials: true,
	});
}

async function reportError(env: Env, error: unknown): Promise<Response> {
	const body = { ok: false, error: error instanceof Error ? error.message : String(error) };
	if (env.SENTRY_DSN && error instanceof Error) {
		await sendSentryEvent(env.SENTRY_DSN, error);
	}
	return withCorsHeaders(new Response(JSON.stringify(body), { status: 500, headers: { 'content-type': 'application/json' } }),
		{ allowOrigin: '*', allowCredentials: true });
}

async function sendSentryEvent(dsn: string, error: Error) {
	try {
		const url = new URL(dsn);
		const auth = url.username ? `${url.username}:${url.password}` : undefined;
		url.username = '';
		url.password = '';
		const body = {
			message: error.message,
			exception: {
				values: [
					{
						type: error.name,
						value: error.message,
						stacktrace: { frames: error.stack?.split('\n').slice(1) ?? [] },
					},
				],
			},
			level: 'error',
			timestamp: Math.floor(Date.now() / 1000),
		};
		const headers: HeadersInit = { 'content-type': 'application/json' };
		if (auth) {
			headers['authorization'] = `Basic ${btoa(auth)}`;
		}
		await fetch(url.toString(), { method: 'POST', headers, body: JSON.stringify(body) });
	} catch (err) {
		console.warn('Failed to send Sentry event', err);
	}
}

async function trackEvent(env: Env, name: string, properties: Record<string, unknown>) {
	if (!env.SENTRY_DSN) {
		return;
	}
	try {
		await sendSentryEvent(env.SENTRY_DSN, new Error(`${name} ${JSON.stringify(properties)}`));
	} catch (error) {
		console.warn('Observability event failed', error);
	}
}
