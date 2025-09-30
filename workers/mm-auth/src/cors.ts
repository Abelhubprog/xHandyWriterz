export type CorsConfig = {
	allowOrigin: string;
	allowMethods?: string;
	allowHeaders?: string;
	allowCredentials?: boolean;
};

const DEFAULTS: Required<Omit<CorsConfig, 'allowCredentials'>> = {
	allowOrigin: '*',
	allowMethods: 'POST, OPTIONS',
	allowHeaders: 'content-type, authorization',
};

export function withCorsHeaders(response: Response, config?: CorsConfig): Response {
	const headers = new Headers(response.headers);
	const { allowOrigin, allowMethods, allowHeaders } = { ...DEFAULTS, ...config };
	headers.set('access-control-allow-origin', allowOrigin);
	headers.set('access-control-allow-methods', allowMethods);
	headers.set('access-control-allow-headers', allowHeaders);
	if (config?.allowCredentials) {
		headers.set('access-control-allow-credentials', 'true');
	}
	return new Response(response.body, { ...response, headers });
}

export function preflight(config?: CorsConfig): Response {
	return withCorsHeaders(new Response(null, { status: 204 }), config);
}
