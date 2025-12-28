/**
 * File Upload Service
 * Handles file uploads to Cloudflare R2 via upload broker worker
 * Integrates with presigned URL generation and multipart uploads
 */

import { resolveApiUrl } from '@/lib/api-base';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
  bucket: string;
  contentType: string;
  expiresAt: string;
}

export interface MultipartUpload {
  uploadId: string;
  key: string;
  bucket: string;
}

export interface UploadPart {
  partNumber: number;
  etag: string;
}

export class FileUploadService {
  private brokerUrl: string;

  constructor(brokerUrl?: string) {
    const fallbackBase = resolveApiUrl('').replace(/\/$/, '');
    const resolved = brokerUrl || import.meta.env.VITE_UPLOAD_BROKER_URL || fallbackBase;
    const normalized = resolved ? resolved.replace(/\/$/, '') : '';
    this.brokerUrl = normalized.endsWith('/s3') ? normalized.slice(0, -3) : normalized;
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: File,
    path?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Sanitize filename
      const sanitizedName = this.sanitizeFileName(file.name);
      const key = path ? `${path}/${sanitizedName}` : sanitizedName;

      // Get presigned PUT URL
      const presignedData = await this.getPresignedPutUrl(key, file.type);

      // Upload to R2
      await this.uploadToR2(file, presignedData.url, onProgress);

      return {
        key: presignedData.key,
        url: presignedData.url,
        bucket: presignedData.bucket,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    path?: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(
        file,
        path,
        onProgress ? (prog) => onProgress(i, prog) : undefined
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get presigned PUT URL for upload
   */
  async getPresignedPutUrl(
    key: string,
    contentType: string
  ): Promise<PresignedUrlResponse> {
    try {
      const response = await fetch(`${this.brokerUrl}/s3/presign-put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, contentType }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw error;
    }
  }

  /**
   * Get presigned GET URL for download
   */
  async getPresignedGetUrl(key: string): Promise<string> {
    try {
      const response = await fetch(`${this.brokerUrl}/s3/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, method: 'GET' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Presigned GET URL error:', error);
      throw error;
    }
  }

  /**
   * Upload file to R2 using presigned URL
   */
  private async uploadToR2(
    file: File,
    presignedUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: (e.loaded / e.total) * 100,
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  /**
   * Create multipart upload for large files
   */
  async createMultipartUpload(
    key: string,
    contentType: string
  ): Promise<MultipartUpload> {
    try {
      const response = await fetch(`${this.brokerUrl}/s3/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, contentType }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create multipart upload: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create multipart upload error:', error);
      throw error;
    }
  }

  /**
   * Sign multipart upload part
   */
  async signUploadPart(
    key: string,
    uploadId: string,
    partNumber: number
  ): Promise<string> {
    try {
      const response = await fetch(`${this.brokerUrl}/s3/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, partNumber }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sign upload part: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Sign upload part error:', error);
      throw error;
    }
  }

  /**
   * Complete multipart upload
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: UploadPart[]
  ): Promise<void> {
    try {
      const response = await fetch(`${this.brokerUrl}/s3/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      });

      if (!response.ok) {
        throw new Error(`Failed to complete multipart upload: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Complete multipart upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.brokerUrl}/s3/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  /**
   * Sanitize filename for safe storage
   */
  sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(`${category}/`);
      }
      return file.type === type;
    });
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }

  /**
   * Check if file is image
   */
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Check if file is video
   */
  isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  /**
   * Check if file is document
   */
  isDocument(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    return documentTypes.includes(file.type);
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

// Export for direct usage
export default fileUploadService;
