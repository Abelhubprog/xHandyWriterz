import { getMattermostWebsocketUrl, POST_SCHEMA, type MattermostPost } from '@/lib/mm-client';
import { z } from 'zod';

export type MattermostRealtimeEvent =
  | { type: 'open' }
  | { type: 'close'; code: number; reason: string }
  | { type: 'error'; error: Event }
  | { type: 'posted'; post: MattermostPost }
  | { type: 'typing'; userId: string; channelId: string; parentId: string }
  | { type: 'status'; userId: string; status: string };

const rawSocketEnvelope = z.object({
  event: z.string(),
  data: z.record(z.any()).optional().default({}),
  seq: z.number().optional(),
});

type Listener = (event: MattermostRealtimeEvent) => void;

class MattermostRealtimeClient {
  private ws?: WebSocket;
  private reconnectAttempts = 0;
  private readonly listeners = new Set<Listener>();
  private shouldReconnect = false;
  private heartbeat?: number;
  private refCount = 0;
  private readonly url: string;
  private seq = 1;

  constructor(url: string) {
    this.url = url;
  }

  retain(): () => void {
    this.refCount += 1;
    this.shouldReconnect = true;
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }
    return () => {
      this.refCount = Math.max(0, this.refCount - 1);
      if (this.refCount === 0) {
        this.shouldReconnect = false;
        this.disconnect();
      }
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.ws.addEventListener('open', this.handleOpen);
      this.ws.addEventListener('message', this.handleMessage);
      this.ws.addEventListener('close', this.handleClose);
      this.ws.addEventListener('error', this.handleError);
    } catch (error) {
      console.error('Mattermost websocket failed to open', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.removeEventListener('open', this.handleOpen);
      this.ws.removeEventListener('message', this.handleMessage);
      this.ws.removeEventListener('close', this.handleClose);
      this.ws.removeEventListener('error', this.handleError);
      this.ws.close();
      this.ws = undefined;
    }
  }

  sendTyping(channelId: string, parentId = ''): void {
    this.send({ action: 'user_typing', channel_id: channelId, parent_id: parentId });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeat = window.setInterval(() => {
      this.send({ action: 'ping' });
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat) {
      window.clearInterval(this.heartbeat);
      this.heartbeat = undefined;
    }
  }

  private broadcast(event: MattermostRealtimeEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Mattermost realtime listener error', error);
      }
    });
  }

  private readonly handleOpen = () => {
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.broadcast({ type: 'open' });
  };

  private readonly handleClose = (event: CloseEvent) => {
    this.stopHeartbeat();
    this.broadcast({ type: 'close', code: event.code, reason: event.reason });
    this.ws = undefined;
    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  };

  private readonly handleError = (event: Event) => {
    this.broadcast({ type: 'error', error: event });
  };

  private readonly handleMessage = (event: MessageEvent) => {
    try {
      const parsed = rawSocketEnvelope.parse(JSON.parse(event.data));
      switch (parsed.event) {
        case 'hello':
          this.startHeartbeat();
          break;
        case 'ping':
          this.send({ action: 'ping' });
          break;
        case 'posted': {
          const postJson = parsed.data.post as string | undefined;
          if (!postJson) return;
          const post = POST_SCHEMA.parse(JSON.parse(postJson));
          this.broadcast({ type: 'posted', post });
          break;
        }
        case 'typing': {
          const channelId = String(parsed.data.channel_id ?? '');
          const userId = String(parsed.data.user_id ?? '');
          const parentId = String(parsed.data.parent_id ?? '');
          if (channelId && userId) {
            this.broadcast({ type: 'typing', channelId, userId, parentId });
          }
          break;
        }
        case 'status_change': {
          const userId = String(parsed.data.user_id ?? '');
          const status = String(parsed.data.status ?? 'online');
          if (userId) {
            this.broadcast({ type: 'status', userId, status });
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to parse Mattermost websocket event', error, event.data);
    }
  };

  private send(payload: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
  this.seq += 1;
  const next = { ...payload, seq: this.seq };
  this.ws.send(JSON.stringify(next));
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) {
      return;
    }
    const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts += 1;
    window.setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }
}

let singleton: MattermostRealtimeClient | null = null;

export function getMattermostRealtimeClient(): MattermostRealtimeClient {
  if (!singleton) {
    const url = getMattermostWebsocketUrl();
    singleton = new MattermostRealtimeClient(url);
  }
  return singleton;
}
