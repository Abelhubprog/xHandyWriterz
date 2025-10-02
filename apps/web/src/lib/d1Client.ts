/**
 * Cloudflare D1 Database Client
 * Provides interface for interacting with Cloudflare D1 databases
 */

export interface D1QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

export class D1Client {
  private apiUrl: string;
  private apiToken: string;
  private accountId: string;
  private databaseId: string;

  constructor(config?: {
    apiUrl?: string;
    apiToken?: string;
    accountId?: string;
    databaseId?: string;
  }) {
    this.apiUrl = config?.apiUrl || import.meta.env.VITE_CF_API_URL || 'https://api.cloudflare.com/client/v4';
    this.apiToken = config?.apiToken || import.meta.env.VITE_CF_API_TOKEN || '';
    this.accountId = config?.accountId || import.meta.env.VITE_CF_ACCOUNT_ID || '';
    this.databaseId = config?.databaseId || import.meta.env.VITE_CF_D1_DATABASE_ID || '';
  }

  /**
   * Execute a SQL query
   */
  async query<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<D1QueryResult<T>> {
    if (!this.isConfigured()) {
      console.warn('D1 client not fully configured');
      return {
        results: [],
        success: false,
        meta: { duration: 0, rows_read: 0, rows_written: 0 },
      };
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/accounts/${this.accountId}/d1/database/${this.databaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql,
            params,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`D1 query failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result[0] || {
        results: [],
        success: false,
        meta: { duration: 0, rows_read: 0, rows_written: 0 },
      };
    } catch (error) {
      console.error('D1 query error:', error);
      throw error;
    }
  }

  /**
   * Execute multiple SQL statements
   */
  async exec(sql: string): Promise<D1ExecResult> {
    if (!this.isConfigured()) {
      console.warn('D1 client not fully configured');
      return { count: 0, duration: 0 };
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/accounts/${this.accountId}/d1/database/${this.databaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }
      );

      if (!response.ok) {
        throw new Error(`D1 exec failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        count: data.result?.length || 0,
        duration: data.result?.[0]?.meta?.duration || 0,
      };
    } catch (error) {
      console.error('D1 exec error:', error);
      throw error;
    }
  }

  /**
   * Execute batch queries
   */
  async batch<T = any>(
    queries: Array<{ sql: string; params?: any[] }>
  ): Promise<D1QueryResult<T>[]> {
    if (!this.isConfigured()) {
      console.warn('D1 client not fully configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/accounts/${this.accountId}/d1/database/${this.databaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queries),
        }
      );

      if (!response.ok) {
        throw new Error(`D1 batch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('D1 batch error:', error);
      throw error;
    }
  }

  /**
   * Prepare statement for reuse
   */
  prepare(sql: string) {
    return {
      bind: (...params: any[]) => ({
        all: () => this.query(sql, params),
        first: async () => {
          const result = await this.query(sql, params);
          return result.results[0] || null;
        },
        run: () => this.query(sql, params),
      }),
      all: () => this.query(sql),
      first: async () => {
        const result = await this.query(sql);
        return result.results[0] || null;
      },
      run: () => this.query(sql),
    };
  }

  /**
   * Dump database
   */
  async dump(): Promise<Blob> {
    if (!this.isConfigured()) {
      throw new Error('D1 client not fully configured');
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/accounts/${this.accountId}/d1/database/${this.databaseId}/export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`D1 dump failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('D1 dump error:', error);
      throw error;
    }
  }

  /**
   * Get database info
   */
  async getInfo(): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('D1 client not fully configured');
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/accounts/${this.accountId}/d1/database/${this.databaseId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`D1 getInfo failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('D1 getInfo error:', error);
      throw error;
    }
  }

  /**
   * Check if client is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiToken && this.accountId && this.databaseId);
  }
}

// Export singleton instance
export const d1Client = new D1Client();

// Export for direct usage
export default d1Client;
