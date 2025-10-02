/**
 * Integration tests for content publishing flow
 * Tests: Strapi content creation → publish → front-end render
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

describe('Content Publishing Flow', () => {
  let testServiceId: number;
  const testSlug = `test-service-${Date.now()}`;

  beforeAll(async () => {
    if (!STRAPI_TOKEN) {
      throw new Error('STRAPI_TOKEN environment variable required for integration tests');
    }
  });

  afterAll(async () => {
    // Cleanup: delete test service
    if (testServiceId) {
      await fetch(`${STRAPI_URL}/api/services/${testServiceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      });
    }
  });

  it('should create a draft service in Strapi', async () => {
    const response = await fetch(`${STRAPI_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          title: 'Test Service',
          slug: testSlug,
          summary: 'This is a test service for integration testing',
          body: '# Test Content\n\nThis is test content for integration testing.',
          domain: 'enterprise',
          typeTags: ['test', 'integration'],
        },
      }),
    });

    expect(response.ok).toBe(true);
    const result = await response.json();
    testServiceId = result.data.id;
    expect(testServiceId).toBeDefined();
    expect(result.data.attributes.slug).toBe(testSlug);
    expect(result.data.attributes.publishedAt).toBeNull(); // Should be draft
  });

  it('should publish the service', async () => {
    const response = await fetch(`${STRAPI_URL}/api/services/${testServiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          publishedAt: new Date().toISOString(),
        },
      }),
    });

    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.data.attributes.publishedAt).not.toBeNull();
  });

  it('should fetch published service from Strapi API', async () => {
    const response = await fetch(`${STRAPI_URL}/api/services?filters[slug][$eq]=${testSlug}&populate=*`);
    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].attributes.slug).toBe(testSlug);
  });

  it('should render published service on front-end', async () => {
    const response = await fetch(`${WEB_URL}/services/enterprise/${testSlug}`);
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toContain('Test Service');
    expect(html).toContain('test service for integration testing');
  });
});
