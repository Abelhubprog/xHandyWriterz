/**
 * Appwrite Storage Client
 * Provides interface for interacting with Appwrite storage
 */

import { ID } from 'appwrite';

export interface AppwriteConfig {
  endpoint?: string;
  projectId?: string;
  apiKey?: string;
  bucketId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StorageFile {
  $id: string;
  name: string;
  signature: string;
  mimeType: string;
  sizeOriginal: number;
  chunksTotal: number;
  chunksUploaded: number;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

export class AppwriteStorage {
  private endpoint: string;
  private projectId: string;
  private apiKey: string;
  private bucketId: string;

  constructor(config?: AppwriteConfig) {
    this.endpoint = config?.endpoint || import.meta.env.VITE_APPWRITE_ENDPOINT || '';
    this.projectId = config?.projectId || import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
    this.apiKey = config?.apiKey || import.meta.env.VITE_APPWRITE_API_KEY || '';
    this.bucketId = config?.bucketId || import.meta.env.VITE_APPWRITE_BUCKET_ID || '';
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Appwrite storage not configured');
    }

    try {
      const response = await fetch(`${this.endpoint}${endpoint}`, {
        ...options,
        headers: {
          'X-Appwrite-Project': this.projectId,
          'X-Appwrite-Key': this.apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Appwrite storage error:', error);
      throw error;
    }
  }

  /**
   * Create file
   */
  async createFile(
    file: File,
    fileId?: string,
    permissions?: string[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<StorageFile> {
    if (!this.isConfigured()) {
      throw new Error('Appwrite storage not configured');
    }

    const id = fileId || ID.unique();
    const formData = new FormData();
    formData.append('fileId', id);
    formData.append('file', file);
    
    if (permissions) {
      formData.append('permissions', JSON.stringify(permissions));
    }

    try {
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${this.endpoint}/storage/buckets/${this.bucketId}/files`);
        xhr.setRequestHeader('X-Appwrite-Project', this.projectId);
        xhr.setRequestHeader('X-Appwrite-Key', this.apiKey);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Get file
   */
  async getFile(fileId: string): Promise<StorageFile> {
    return this.request(`/storage/buckets/${this.bucketId}/files/${fileId}`);
  }

  /**
   * List files
   */
  async listFiles(
    queries?: string[],
    search?: string
  ): Promise<{ total: number; files: StorageFile[] }> {
    const params = new URLSearchParams();
    if (queries) {
      queries.forEach(q => params.append('queries[]', q));
    }
    if (search) {
      params.append('search', search);
    }

    return this.request(
      `/storage/buckets/${this.bucketId}/files${params.toString() ? `?${params}` : ''}`
    );
  }

  /**
   * Get file preview
   */
  getFilePreview(
    fileId: string,
    options?: {
      width?: number;
      height?: number;
      gravity?: string;
      quality?: number;
      borderWidth?: number;
      borderColor?: string;
      borderRadius?: number;
      opacity?: number;
      rotation?: number;
      background?: string;
      output?: string;
    }
  ): string {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return `${this.endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/preview${params.toString() ? `?${params}` : ''}`;
  }

  /**
   * Get file download URL
   */
  getFileDownload(fileId: string): string {
    return `${this.endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/download`;
  }

  /**
   * Get file view URL
   */
  getFileView(fileId: string): string {
    return `${this.endpoint}/storage/buckets/${this.bucketId}/files/${fileId}/view`;
  }

  /**
   * Update file
   */
  async updateFile(
    fileId: string,
    name?: string,
    permissions?: string[]
  ): Promise<StorageFile> {
    const data: any = {};
    if (name) data.name = name;
    if (permissions) data.permissions = permissions;

    return this.request(`/storage/buckets/${this.bucketId}/files/${fileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.request(`/storage/buckets/${this.bucketId}/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Download file as blob
   */
  async downloadFile(fileId: string): Promise<Blob> {
    const url = this.getFileDownload(fileId);
    
    const response = await fetch(url, {
      headers: {
        'X-Appwrite-Project': this.projectId,
        'X-Appwrite-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    permissions?: string[],
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<StorageFile[]> {
    const results: StorageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.createFile(
        file,
        undefined,
        permissions,
        (progress) => onProgress?.(i, progress)
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    return !!(this.endpoint && this.projectId && this.apiKey && this.bucketId);
  }

  /**
   * Get storage info
   */
  async getStorageInfo(): Promise<any> {
    return this.request(`/storage/buckets/${this.bucketId}`);
  }
}

// Export singleton instance
export const appwriteStorage = new AppwriteStorage();

// Export for direct usage
export default appwriteStorage;
