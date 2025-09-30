import { env } from '@/env';
import { z } from 'zod';

export class MattermostConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MattermostConfigError';
  }
}

export class MattermostApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'MattermostApiError';
    this.status = status;
    this.details = details;
  }
}

const fileInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  extension: z.string().optional().default(''),
  size: z.number(),
  mime_type: z.string().optional().default('application/octet-stream'),
  width: z.number().optional(),
  height: z.number().optional(),
  has_preview_image: z.boolean().optional(),
  create_at: z.number().optional(),
  post_id: z.string().optional(),
});

export type MattermostFileInfo = z.infer<typeof fileInfoSchema>;

const postSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  channel_id: z.string(),
  message: z.string(),
  type: z.string().optional().default(''),
  create_at: z.number(),
  update_at: z.number(),
  delete_at: z.number(),
  props: z.record(z.any()).optional().default({}),
  file_ids: z.array(z.string()).optional().default([]),
  metadata: z
    .object({
      files: z.array(fileInfoSchema).optional().default([]),
    })
    .optional()
    .default({ files: [] }),
});

export type MattermostPost = z.infer<typeof postSchema>;

const channelSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  type: z.enum(['O', 'P', 'D', 'G']).default('O'),
  name: z.string(),
  display_name: z.string(),
  header: z.string().optional().default(''),
  purpose: z.string().optional().default(''),
  total_msg_count: z.number().optional().default(0),
  create_at: z.number().optional(),
  update_at: z.number().optional(),
  last_post_at: z.number().optional().default(0),
  creator_id: z.string().optional(),
  scheme_id: z.string().nullable().optional(),
});

export type MattermostChannel = z.infer<typeof channelSchema>;

const teamSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  type: z.enum(['O', 'I']).default('O'),
});

export type MattermostTeam = z.infer<typeof teamSchema>;

const userSummarySchema = z.object({
  id: z.string(),
  username: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  nickname: z.string().optional(),
});

export type MattermostUserSummary = z.infer<typeof userSummarySchema>;

const postListSchema = z.object({
  order: z.array(z.string()),
  posts: z.record(postSchema),
  next_post_id: z.string().nullable().optional(),
  prev_post_id: z.string().nullable().optional(),
});

const fileUploadResponseSchema = z.object({
  file_infos: z.array(fileInfoSchema),
  client_ids: z.array(z.string()).optional().default([]),
});

const exchangeResponseSchema = z.object({
  ok: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    first_name: z.string().optional().default(''),
    last_name: z.string().optional().default(''),
  }),
  expiresAt: z.number(),
});

export type ExchangeResponse = z.infer<typeof exchangeResponseSchema>;

const refreshResponseSchema = z.object({
  ok: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    first_name: z.string().optional().default(''),
    last_name: z.string().optional().default(''),
  }),
});

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

const errorEnvelopeSchema = z.object({
  ok: z.literal(false).optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  status_code: z.number().optional(),
  detailed_error: z.string().optional(),
});

type RequestOptions = RequestInit;

function normaliseBaseUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function computeApiBaseUrl(): string | undefined {
  if (env.VITE_MATTERMOST_API_URL) {
    return normaliseBaseUrl(env.VITE_MATTERMOST_API_URL);
  }
  if (env.VITE_MATTERMOST_URL) {
    try {
      const apiUrl = new URL('/api/v4', env.VITE_MATTERMOST_URL);
      return normaliseBaseUrl(apiUrl.toString());
    } catch (error) {
      console.warn('Unable to derive Mattermost API URL from VITE_MATTERMOST_URL', error);
      return undefined;
    }
  }
  return undefined;
}

function computeWsUrl(apiBaseUrl: string): string {
  const url = new URL(apiBaseUrl);
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${url.host}${url.pathname.replace(/\/api\/v4$/, '')}/api/v4/websocket`;
}

export const POST_SCHEMA = postSchema;
export const FILE_INFO_SCHEMA = fileInfoSchema;
export const CHANNEL_SCHEMA = channelSchema;
export const TEAM_SCHEMA = teamSchema;

export interface MattermostRestClientConfig {
  baseUrl?: string;
  authUrl?: string;
  teamId?: string;
}

export class MattermostRestClient {
  private readonly baseUrl?: string;
  private readonly authUrl?: string;
  private readonly defaultTeamId?: string;

  constructor(config: MattermostRestClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? computeApiBaseUrl();
    this.authUrl = config.authUrl ?? env.VITE_MM_AUTH_URL ?? undefined;
    this.defaultTeamId = config.teamId ?? env.VITE_MATTERMOST_TEAM_ID ?? undefined;
  }

  get configured(): boolean {
    return Boolean(this.baseUrl && this.authUrl);
  }

  get apiBaseUrl(): string {
    if (!this.baseUrl) {
      throw new MattermostConfigError('Mattermost API base URL is not configured. Set VITE_MATTERMOST_API_URL or VITE_MATTERMOST_URL.');
    }
    return this.baseUrl;
  }

  get websocketUrl(): string {
    return computeWsUrl(this.apiBaseUrl);
  }

  get authEndpoint(): string {
    if (!this.authUrl) {
      throw new MattermostConfigError('Mattermost auth worker URL is not configured. Set VITE_MM_AUTH_URL.');
    }
    return normaliseBaseUrl(this.authUrl)!;
  }

  async exchange(token: string): Promise<ExchangeResponse> {
    const response = await this.fetchAuth('/exchange', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'content-type': 'application/json' },
    });
    const data = await response.json();
    return exchangeResponseSchema.parse(data);
  }

  async refresh(): Promise<RefreshResponse> {
    const response = await this.fetchAuth('/refresh', { method: 'POST' });
    const data = await response.json();
    return refreshResponseSchema.parse(data);
  }

  async logout(): Promise<void> {
    await this.fetchAuth('/logout', { method: 'POST' });
  }

  async listTeams(): Promise<MattermostTeam[]> {
    const data = await this.request('/users/me/teams', { method: 'GET' }, z.array(teamSchema));
    return data;
  }

  async listChannels(teamId?: string): Promise<MattermostChannel[]> {
    const resolvedTeamId = teamId ?? this.defaultTeamId;
    if (!resolvedTeamId) {
      const [firstTeam] = await this.listTeams();
      if (!firstTeam) {
        return [];
      }
      return this.listChannels(firstTeam.id);
    }
    const path = `/users/me/teams/${encodeURIComponent(resolvedTeamId)}/channels`;
    const data = await this.request(path, { method: 'GET' }, z.array(channelSchema));
    return data.sort((a, b) => (b.last_post_at ?? 0) - (a.last_post_at ?? 0));
  }

  async getChannel(channelId: string): Promise<MattermostChannel> {
    return this.request(`/channels/${encodeURIComponent(channelId)}`, { method: 'GET' }, channelSchema);
  }

  async getPosts(channelId: string, page = 0, perPage = 30): Promise<{ order: string[]; posts: Record<string, MattermostPost> }> {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    const payload = await this.request(`/channels/${encodeURIComponent(channelId)}/posts?${params.toString()}`, { method: 'GET' }, postListSchema);
    return {
      order: payload.order,
      posts: payload.posts,
    };
  }

  async createPost(input: { channelId: string; message: string; rootId?: string; fileIds?: string[] }): Promise<MattermostPost> {
    const response = await this.request(
      '/posts',
      {
        method: 'POST',
        body: JSON.stringify({
          channel_id: input.channelId,
          message: input.message,
          root_id: input.rootId ?? '',
          file_ids: input.fileIds ?? [],
        }),
        headers: { 'content-type': 'application/json' },
      },
      postSchema,
    );
    return response;
  }

  async markChannelViewed(channelId: string): Promise<void> {
    await this.request(`/channels/${encodeURIComponent(channelId)}/members/me/view`, { method: 'POST' });
  }

  async uploadFiles(channelId: string, files: File[]): Promise<MattermostFileInfo[]> {
    if (!files.length) {
      return [];
    }
    const form = new FormData();
    form.append('channel_id', channelId);
    files.forEach((file, idx) => {
      form.append('files', file, file.name);
      form.append('client_ids', `${Date.now()}_${idx}`);
    });
    const response = await this.request('/files', { method: 'POST', body: form }, fileUploadResponseSchema);
    return response.file_infos;
  }

  async getUsersByIds(ids: string[]): Promise<Record<string, MattermostUserSummary>> {
    if (!ids.length) {
      return {};
    }
    const data = await this.request(
      '/users/ids',
      {
        method: 'POST',
        body: JSON.stringify(ids),
        headers: { 'content-type': 'application/json' },
      },
      z.array(userSummarySchema),
    );
    return data.reduce<Record<string, MattermostUserSummary>>(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {},
    );
  }

  private async fetchAuth(path: string, init: RequestInit): Promise<Response> {
    const url = `${this.authEndpoint}${path}`;
    const response = await fetch(url, {
      ...init,
      credentials: 'include',
    });
    if (!response.ok) {
      const payload = await safeParse(response);
      const message = payload?.error || payload?.message || `Mattermost auth request failed (${response.status})`;
      throw new MattermostApiError(message, response.status, payload);
    }
    return response;
  }

  private async request<T>(path: string, init: RequestOptions, schema?: z.ZodSchema<T>): Promise<T> {
    const url = `${this.apiBaseUrl}${path}`;
    const headers = new Headers(init.headers ?? {});
    if (!(init.body instanceof FormData) && !headers.has('content-type') && init.body) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetch(url, {
      ...init,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const payload = await safeParse(response);
      const message = payload?.message || payload?.error || `Mattermost request failed (${response.status})`;
      throw new MattermostApiError(message, response.status, payload);
    }

    if (schema) {
      const json = await response.json();
      return schema.parse(json);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const json = await response.json();
    return json as T;
  }
}

async function safeParse(response: Response): Promise<z.infer<typeof errorEnvelopeSchema> | undefined> {
  try {
    const text = await response.text();
    if (!text) return undefined;
    return errorEnvelopeSchema.parse(JSON.parse(text));
  } catch (error) {
    return undefined;
  }
}

export const mattermostClient = new MattermostRestClient({
  baseUrl: computeApiBaseUrl(),
  authUrl: env.VITE_MM_AUTH_URL ?? undefined,
  teamId: env.VITE_MATTERMOST_TEAM_ID ?? undefined,
});

export type MattermostUserProfile = ExchangeResponse['user'];

export function getMattermostWebsocketUrl(): string {
  return mattermostClient.websocketUrl;
}
