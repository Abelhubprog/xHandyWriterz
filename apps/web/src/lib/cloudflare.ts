/**
 * Cloudflare API Utilities
 * Provides helpers for interacting with Cloudflare services
 */

export interface CloudflareConfig {
  apiUrl?: string;
  apiToken?: string;
  accountId?: string;
  zoneId?: string;
}

export interface WorkerRoute {
  id: string;
  pattern: string;
  script?: string;
  enabled?: boolean;
}

export interface KVNamespace {
  id: string;
  title: string;
  supports_url_encoding?: boolean;
}

export interface R2Bucket {
  name: string;
  creation_date: string;
  location?: string;
}

export class CloudflareAPI {
  private apiUrl: string;
  private apiToken: string;
  private accountId: string;
  private zoneId: string;

  constructor(config?: CloudflareConfig) {
    this.apiUrl = config?.apiUrl || import.meta.env.VITE_CF_API_URL || 'https://api.cloudflare.com/client/v4';
    this.apiToken = config?.apiToken || import.meta.env.VITE_CF_API_TOKEN || '';
    this.accountId = config?.accountId || import.meta.env.VITE_CF_ACCOUNT_ID || '';
    this.zoneId = config?.zoneId || import.meta.env.VITE_CF_ZONE_ID || '';
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiToken) {
      throw new Error('Cloudflare API token not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || `Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Cloudflare API error:', error);
      throw error;
    }
  }

  /**
   * Workers API
   */
  workers = {
    list: () => this.request<any[]>(`/accounts/${this.accountId}/workers/scripts`),
    
    get: (scriptName: string) => 
      this.request(`/accounts/${this.accountId}/workers/scripts/${scriptName}`),
    
    upload: async (scriptName: string, script: string, bindings: any[] = []) => {
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({ 
        body_part: 'script',
        bindings,
      }));
      formData.append('script', new Blob([script], { type: 'application/javascript' }));
      
      return this.request(`/accounts/${this.accountId}/workers/scripts/${scriptName}`, {
        method: 'PUT',
        body: formData,
        headers: {},
      });
    },
    
    delete: (scriptName: string) =>
      this.request(`/accounts/${this.accountId}/workers/scripts/${scriptName}`, {
        method: 'DELETE',
      }),
    
    routes: {
      list: () => this.request<WorkerRoute[]>(`/zones/${this.zoneId}/workers/routes`),
      
      create: (pattern: string, script: string) =>
        this.request(`/zones/${this.zoneId}/workers/routes`, {
          method: 'POST',
          body: JSON.stringify({ pattern, script }),
        }),
      
      delete: (routeId: string) =>
        this.request(`/zones/${this.zoneId}/workers/routes/${routeId}`, {
          method: 'DELETE',
        }),
    },
  };

  /**
   * KV Namespace API
   */
  kv = {
    listNamespaces: () => 
      this.request<KVNamespace[]>(`/accounts/${this.accountId}/storage/kv/namespaces`),
    
    createNamespace: (title: string) =>
      this.request(`/accounts/${this.accountId}/storage/kv/namespaces`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    
    deleteNamespace: (namespaceId: string) =>
      this.request(`/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}`, {
        method: 'DELETE',
      }),
    
    listKeys: (namespaceId: string, prefix?: string) =>
      this.request(`/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/keys${prefix ? `?prefix=${prefix}` : ''}`),
    
    read: async (namespaceId: string, key: string): Promise<string | null> => {
      try {
        const response = await fetch(
          `${this.apiUrl}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
          {
            headers: { 'Authorization': `Bearer ${this.apiToken}` },
          }
        );
        return response.ok ? await response.text() : null;
      } catch {
        return null;
      }
    },
    
    write: (namespaceId: string, key: string, value: string, metadata?: any) =>
      this.request(`/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, metadata }),
      }),
    
    delete: (namespaceId: string, key: string) =>
      this.request(`/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`, {
        method: 'DELETE',
      }),
  };

  /**
   * R2 Storage API
   */
  r2 = {
    listBuckets: () =>
      this.request<R2Bucket[]>(`/accounts/${this.accountId}/r2/buckets`),
    
    createBucket: (name: string, locationHint?: string) =>
      this.request(`/accounts/${this.accountId}/r2/buckets`, {
        method: 'POST',
        body: JSON.stringify({ name, locationHint }),
      }),
    
    deleteBucket: (name: string) =>
      this.request(`/accounts/${this.accountId}/r2/buckets/${name}`, {
        method: 'DELETE',
      }),
    
    getBucket: (name: string) =>
      this.request(`/accounts/${this.accountId}/r2/buckets/${name}`),
  };

  /**
   * Cache Purge API
   */
  cache = {
    purgeAll: () =>
      this.request(`/zones/${this.zoneId}/purge_cache`, {
        method: 'POST',
        body: JSON.stringify({ purge_everything: true }),
      }),
    
    purgeByUrl: (urls: string[]) =>
      this.request(`/zones/${this.zoneId}/purge_cache`, {
        method: 'POST',
        body: JSON.stringify({ files: urls }),
      }),
    
    purgeByTag: (tags: string[]) =>
      this.request(`/zones/${this.zoneId}/purge_cache`, {
        method: 'POST',
        body: JSON.stringify({ tags }),
      }),
  };

  /**
   * Analytics API
   */
  analytics = {
    getZoneAnalytics: (since?: string, until?: string) => {
      const params = new URLSearchParams();
      if (since) params.append('since', since);
      if (until) params.append('until', until);
      
      return this.request(`/zones/${this.zoneId}/analytics/dashboard?${params}`);
    },
    
    getWorkerAnalytics: (scriptName: string) =>
      this.request(`/accounts/${this.accountId}/workers/scripts/${scriptName}/metrics`),
  };

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!(this.apiToken && this.accountId);
  }
}

// Export singleton instance
export const cloudflareAPI = new CloudflareAPI();

// Export helper functions
export const purgeCache = (urls?: string[]) => {
  if (urls && urls.length > 0) {
    return cloudflareAPI.cache.purgeByUrl(urls);
  }
  return cloudflareAPI.cache.purgeAll();
};

export const getKVValue = (namespaceId: string, key: string) =>
  cloudflareAPI.kv.read(namespaceId, key);

export const setKVValue = (namespaceId: string, key: string, value: string, metadata?: any) =>
  cloudflareAPI.kv.write(namespaceId, key, value, metadata);

// Export for direct usage
export default cloudflareAPI;
