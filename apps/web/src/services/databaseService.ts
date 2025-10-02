/**
 * Database Service
 * Handles database operations with support for different backends
 * (Cloudflare D1, PostgreSQL, etc.)
 */

export interface QueryResult<T = any> {
  rows: T[];
  count: number;
  success: boolean;
}

export interface DatabaseConfig {
  type: 'd1' | 'postgres' | 'sqlite';
  connectionString?: string;
  apiUrl?: string;
}

export class DatabaseService {
  private config: DatabaseConfig;
  private apiUrl: string;

  constructor(config?: DatabaseConfig) {
    this.config = config || {
      type: 'd1',
      apiUrl: '/api/db',
    };
    this.apiUrl = this.config.apiUrl || '/api/db';
  }

  /**
   * Execute raw SQL query
   */
  async query<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<QueryResult<T>> {
    try {
      const response = await fetch(`${this.apiUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, params }),
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        rows: result.rows || [],
        count: result.count || result.rows?.length || 0,
        success: true,
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Insert record
   */
  async insert<T = any>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.query<T>(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }

  /**
   * Update record
   */
  async update<T = any>(
    table: string,
    id: string | number,
    data: Record<string, any>
  ): Promise<T> {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

      const sql = `
        UPDATE ${table}
        SET ${setClause}
        WHERE id = $${columns.length + 1}
        RETURNING *
      `;

      const result = await this.query<T>(sql, [...values, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  }

  /**
   * Delete record
   */
  async delete(
    table: string,
    id: string | number
  ): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${table} WHERE id = $1`;
      await this.query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById<T = any>(
    table: string,
    id: string | number
  ): Promise<T | null> {
    try {
      const sql = `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`;
      const result = await this.query<T>(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database findById error:', error);
      throw error;
    }
  }

  /**
   * Find records with conditions
   */
  async find<T = any>(
    table: string,
    conditions?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    }
  ): Promise<QueryResult<T>> {
    try {
      let sql = `SELECT * FROM ${table}`;
      const params: any[] = [];

      // Add WHERE clause
      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map((key, i) => `${key} = $${i + 1}`)
          .join(' AND ');
        sql += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      // Add ORDER BY
      if (options?.orderBy) {
        sql += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      }

      // Add LIMIT
      if (options?.limit) {
        sql += ` LIMIT $${params.length + 1}`;
        params.push(options.limit);
      }

      // Add OFFSET
      if (options?.offset) {
        sql += ` OFFSET $${params.length + 1}`;
        params.push(options.offset);
      }

      return await this.query<T>(sql, params);
    } catch (error) {
      console.error('Database find error:', error);
      throw error;
    }
  }

  /**
   * Find one record
   */
  async findOne<T = any>(
    table: string,
    conditions: Record<string, any>
  ): Promise<T | null> {
    try {
      const result = await this.find<T>(table, conditions, { limit: 1 });
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database findOne error:', error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(
    table: string,
    conditions?: Record<string, any>
  ): Promise<number> {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${table}`;
      const params: any[] = [];

      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map((key, i) => `${key} = $${i + 1}`)
          .join(' AND ');
        sql += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const result = await this.query<{ count: number }>(sql, params);
      return result.rows[0]?.count || 0;
    } catch (error) {
      console.error('Database count error:', error);
      throw error;
    }
  }

  /**
   * Execute transaction
   */
  async transaction(
    queries: Array<{ sql: string; params?: any[] }>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries }),
      });

      if (!response.ok) {
        throw new Error(`Transaction failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Database transaction error:', error);
      throw error;
    }
  }

  /**
   * Check if table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const sql = `
        SELECT name FROM sqlite_master
        WHERE type='table' AND name=$1
      `;
      const result = await this.query(sql, [tableName]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database tableExists error:', error);
      return false;
    }
  }

  /**
   * Execute batch inserts
   */
  async batchInsert<T = any>(
    table: string,
    records: Record<string, any>[]
  ): Promise<T[]> {
    try {
      const queries = records.map((data) => {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        return {
          sql: `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING *
          `,
          params: values,
        };
      });

      const response = await fetch(`${this.apiUrl}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries }),
      });

      if (!response.ok) {
        throw new Error(`Batch insert failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.rows || [];
    } catch (error) {
      console.error('Database batch insert error:', error);
      throw error;
    }
  }

  /**
   * Search records with LIKE
   */
  async search<T = any>(
    table: string,
    searchColumn: string,
    searchTerm: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<QueryResult<T>> {
    try {
      let sql = `
        SELECT * FROM ${table}
        WHERE ${searchColumn} LIKE $1
      `;
      const params: any[] = [`%${searchTerm}%`];

      if (options?.limit) {
        sql += ` LIMIT $${params.length + 1}`;
        params.push(options.limit);
      }

      if (options?.offset) {
        sql += ` OFFSET $${params.length + 1}`;
        params.push(options.offset);
      }

      return await this.query<T>(sql, params);
    } catch (error) {
      console.error('Database search error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export for direct usage
export default databaseService;
