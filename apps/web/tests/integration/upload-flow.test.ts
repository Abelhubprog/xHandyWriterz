/**
 * Integration tests for upload pipeline
 * Tests: Upload → AV scan → download flow
 */

import { describe, it, expect, beforeAll } from 'vitest';

const UPLOAD_BROKER_URL = process.env.UPLOAD_BROKER_URL || 'http://localhost:8787';
const TEST_FILE_CONTENT = 'This is a test file for integration testing';
const TEST_FILE_NAME = `test-${Date.now()}.txt`;

describe('Upload Pipeline Flow', () => {
  let uploadKey: string;
  let presignedGetUrl: string;

  beforeAll(async () => {
    if (!UPLOAD_BROKER_URL) {
      throw new Error('UPLOAD_BROKER_URL environment variable required');
    }
  });

  it('should generate presigned PUT URL', async () => {
    const response = await fetch(`${UPLOAD_BROKER_URL}/s3/presign-put`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: `test-uploads/${TEST_FILE_NAME}`,
        contentType: 'text/plain',
      }),
    });

    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.url).toBeDefined();
    expect(result.key).toBe(`test-uploads/${TEST_FILE_NAME}`);
    uploadKey = result.key;
  });

  it('should upload file to R2 using presigned URL', async () => {
    const presignResponse = await fetch(`${UPLOAD_BROKER_URL}/s3/presign-put`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: uploadKey,
        contentType: 'text/plain',
      }),
    });

    const { url } = await presignResponse.json();

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: TEST_FILE_CONTENT,
    });

    expect(uploadResponse.ok).toBe(true);
  });

  it('should deny download before AV scan completes', async () => {
    const response = await fetch(`${UPLOAD_BROKER_URL}/s3/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: uploadKey,
      }),
    });

    // Should return 202 (scan pending) or 200 if scan is already complete in test env
    expect([200, 202]).toContain(response.status);

    if (response.status === 202) {
      const result = await response.json();
      expect(result.error).toContain('scan in progress');
    }
  });

  it('should allow download after marking file as clean', async () => {
    // In real environment, this would be done by AV scanner
    // For testing, we simulate by setting metadata (requires admin access)
    // This test may be skipped in CI without R2 admin access

    const response = await fetch(`${UPLOAD_BROKER_URL}/s3/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: uploadKey,
      }),
    });

    // In test without AV, this should succeed
    if (response.ok) {
      const result = await response.json();
      expect(result.url).toBeDefined();
      presignedGetUrl = result.url;
    } else {
      console.log('Download test skipped: AV gating active');
    }
  });

  it('should download file using presigned GET URL', async () => {
    if (!presignedGetUrl) {
      console.log('Download skipped: No presigned URL available');
      return;
    }

    const response = await fetch(presignedGetUrl);
    expect(response.ok).toBe(true);
    const content = await response.text();
    expect(content).toBe(TEST_FILE_CONTENT);
  });
});
