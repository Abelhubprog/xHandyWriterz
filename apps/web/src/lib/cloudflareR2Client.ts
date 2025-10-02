/**
 * Cloudflare R2 Storage Client
 * Provides S3-compatible interface for Cloudflare R2
 */

export interface R2Config {
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  region?: string;
}

export interface R2Object {
  key: string;
  lastModified: Date;
  etag: string;
  size: number;
  storageClass: string;
}

export interface R2ListResult {
  objects: R2Object[];
  truncated: boolean;
  nextContinuationToken?: string;
}

export interface R2UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface R2PresignedUrl {
  url: string;
  expiresIn: number;
}

export class CloudflareR2Client {
  private endpoint: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucket: string;
  private region: string;

  constructor(config?: R2Config) {
    this.endpoint = config?.endpoint || import.meta.env.VITE_R2_ENDPOINT || '';
    this.accessKeyId = config?.accessKeyId || import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
    this.secretAccessKey = config?.secretAccessKey || import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
    this.bucket = config?.bucket || import.meta.env.VITE_R2_BUCKET || '';
    this.region = config?.region || import.meta.env.VITE_R2_REGION || 'auto';
  }

  /**
   * Create AWS signature for authentication
   */
  private async createSignature(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: string
  ): Promise<string> {
    // Simplified signature creation - in production, use aws4 library
    const timestamp = new Date().toISOString();
    const contentHash = body ? await this.sha256(body) : await this.sha256('');
    
    const canonicalRequest = [
      method,
      path,
      '', // query string
      Object.entries(headers)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k.toLowerCase()}:${v}`)
        .join('\n'),
      '',
      Object.keys(headers)
        .map(k => k.toLowerCase())
        .sort()
        .join(';'),
      contentHash,
    ].join('\n');

    return this.accessKeyId; // Simplified - real implementation needs full AWS signature
  }

  /**
   * SHA-256 hash
   */
  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Put object
   */
  async putObject(
    key: string,
    body: Blob | File | ArrayBuffer | string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      onProgress?: (progress: R2UploadProgress) => void;
    }
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    const contentType = options?.contentType || 'application/octet-stream';
    const url = `${this.endpoint}/${this.bucket}/${key}`;

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (options?.onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              options.onProgress?.({
                loaded: e.loaded,
                total: e.total,
                percentage: Math.round((e.loaded / e.total) * 100),
              });
            }
          });
        }

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', contentType);
        
        if (options?.metadata) {
          Object.entries(options.metadata).forEach(([k, v]) => {
            xhr.setRequestHeader(`x-amz-meta-${k}`, v);
          });
        }

        xhr.send(body);
      });
    } catch (error) {
      console.error('R2 put object error:', error);
      throw error;
    }
  }

  /**
   * Get object
   */
  async getObject(key: string): Promise<Blob> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    const url = `${this.endpoint}/${this.bucket}/${key}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Get object failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('R2 get object error:', error);
      throw error;
    }
  }

  /**
   * Delete object
   */
  async deleteObject(key: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    const url = `${this.endpoint}/${this.bucket}/${key}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete object failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('R2 delete object error:', error);
      throw error;
    }
  }

  /**
   * List objects
   */
  async listObjects(
    prefix?: string,
    maxKeys?: number,
    continuationToken?: string
  ): Promise<R2ListResult> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    const params = new URLSearchParams();
    params.append('list-type', '2');
    if (prefix) params.append('prefix', prefix);
    if (maxKeys) params.append('max-keys', maxKeys.toString());
    if (continuationToken) params.append('continuation-token', continuationToken);

    const url = `${this.endpoint}/${this.bucket}?${params}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`List objects failed: ${response.statusText}`);
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      const objects: R2Object[] = [];
      const contents = xml.querySelectorAll('Contents');
      
      contents.forEach(content => {
        const key = content.querySelector('Key')?.textContent;
        const lastModified = content.querySelector('LastModified')?.textContent;
        const etag = content.querySelector('ETag')?.textContent;
        const size = content.querySelector('Size')?.textContent;
        const storageClass = content.querySelector('StorageClass')?.textContent;

        if (key) {
          objects.push({
            key,
            lastModified: lastModified ? new Date(lastModified) : new Date(),
            etag: etag || '',
            size: size ? parseInt(size) : 0,
            storageClass: storageClass || 'STANDARD',
          });
        }
      });

      const truncated = xml.querySelector('IsTruncated')?.textContent === 'true';
      const nextToken = xml.querySelector('NextContinuationToken')?.textContent;

      return {
        objects,
        truncated,
        nextContinuationToken: nextToken || undefined,
      };
    } catch (error) {
      console.error('R2 list objects error:', error);
      throw error;
    }
  }

  /**
   * Get presigned URL for upload
   */
  async getPresignedPutUrl(
    key: string,
    expiresIn: number = 3600,
    contentType?: string
  ): Promise<R2PresignedUrl> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    // In production, this should use AWS SDK or upload-broker worker
    // For now, return endpoint URL (requires upload-broker integration)
    const url = `${this.endpoint}/${this.bucket}/${key}`;

    return {
      url,
      expiresIn,
    };
  }

  /**
   * Get presigned URL for download
   */
  async getPresignedGetUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    // In production, this should use AWS SDK or upload-broker worker
    // For now, return endpoint URL (requires upload-broker integration)
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  /**
   * Copy object
   */
  async copyObject(
    sourceKey: string,
    destinationKey: string
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    const url = `${this.endpoint}/${this.bucket}/${destinationKey}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-amz-copy-source': `/${this.bucket}/${sourceKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Copy object failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('R2 copy object error:', error);
      throw error;
    }
  }

  /**
   * Head object (get metadata without downloading)
   */
  async headObject(key: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    etag: string;
    metadata: Record<string, string>;
  }> {
    if (!this.isConfigured()) {
      throw new Error('R2 client not configured');
    }

    const url = `${this.endpoint}/${this.bucket}/${key}`;

    try {
      const response = await fetch(url, {
        method: 'HEAD',
      });

      if (!response.ok) {
        throw new Error(`Head object failed: ${response.statusText}`);
      }

      const metadata: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (key.startsWith('x-amz-meta-')) {
          metadata[key.replace('x-amz-meta-', '')] = value;
        }
      });

      return {
        contentType: response.headers.get('content-type') || '',
        contentLength: parseInt(response.headers.get('content-length') || '0'),
        lastModified: new Date(response.headers.get('last-modified') || ''),
        etag: response.headers.get('etag') || '',
        metadata,
      };
    } catch (error) {
      console.error('R2 head object error:', error);
      throw error;
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!(this.endpoint && this.bucket);
  }
}

// Export singleton instance
export const cloudflareR2Client = new CloudflareR2Client();

// Export for direct usage
export default cloudflareR2Client;
