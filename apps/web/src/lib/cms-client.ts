import { GraphQLClient } from 'graphql-request';
import type { Article, Service, ContentBlock } from '@/types/publishing';

class CMSClient {
  private client: GraphQLClient;
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:1337';
    this.token = import.meta.env.VITE_CMS_TOKEN || null;

    this.client = new GraphQLClient(`${this.baseUrl}/graphql`, {
      headers: this.token ? {
        Authorization: `Bearer ${this.token}`,
      } : {},
    });
  }

  // Articles
  async getArticles(filters?: {
    domain?: string;
    status?: 'draft' | 'published';
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const query = `
      query GetArticles(
        $filters: ArticleFiltersInput
        $pagination: PaginationArg
        $sort: [String]
      ) {
        articles(
          filters: $filters
          pagination: $pagination
          sort: $sort
        ) {
          data {
            id
            attributes {
              title
              slug
              summary
              excerpt
              content
              body
              status
              publishedAt
              domain
              categories
              tags
              typeTags
              author
              heroImage {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              images {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              seo {
                title
                description
                ogImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              createdAt
              updatedAt
            }
          }
          meta {
            pagination {
              total
              page
              pageSize
              pageCount
            }
          }
        }
      }
    `;

    return this.client.request(query, {
      filters: {
        ...(filters?.domain && { domain: { eq: filters.domain } }),
        ...(filters?.status && { status: { eq: filters.status } }),
        ...(filters?.search && {
          or: [
            { title: { containsi: filters.search } },
            { summary: { containsi: filters.search } },
            { content: { containsi: filters.search } },
            { body: { containsi: filters.search } }
          ]
        })
      },
      pagination: {
        limit: filters?.limit || 20,
        start: filters?.offset || 0,
      },
      sort: ['publishedAt:desc', 'createdAt:desc']
    });
  }

  async getArticle(slugOrId: string) {
    const query = `
      query GetArticle($slug: String, $id: ID) {
        articles(
          filters: {
            or: [
              { slug: { eq: $slug } }
              { id: { eq: $id } }
            ]
          }
        ) {
          data {
            id
            attributes {
              title
              slug
              summary
              excerpt
              content
              body
              status
              publishedAt
              domain
              categories
              tags
              typeTags
              author
              heroImage {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              images {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              seo {
                title
                description
                ogImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, {
      slug: slugOrId,
      id: !isNaN(Number(slugOrId)) ? slugOrId : null,
    });

    return (result as any).articles?.data?.[0] || null;
  }

  async createArticle(article: Partial<Article>) {
    const mutation = `
      mutation CreateArticle($data: ArticleInput!) {
        createArticle(data: $data) {
          data {
            id
            attributes {
              title
              slug
              status
              createdAt
            }
          }
        }
      }
    `;

    return this.client.request(mutation, {
      data: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: JSON.stringify(article.content || []),
        status: article.status || 'draft',
        domain: article.domain,
        categories: article.categories,
        tags: article.tags,
        seo: article.seo,
        publishAt: article.scheduledAt,
      }
    });
  }

  async updateArticle(id: string, updates: Partial<Article>) {
    const mutation = `
      mutation UpdateArticle($id: ID!, $data: ArticleInput!) {
        updateArticle(id: $id, data: $data) {
          data {
            id
            attributes {
              title
              slug
              status
              updatedAt
            }
          }
        }
      }
    `;

    return this.client.request(mutation, {
      id,
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.slug && { slug: updates.slug }),
        ...(updates.summary && { summary: updates.summary }),
        ...(updates.content && { content: JSON.stringify(updates.content) }),
        ...(updates.status && { status: updates.status }),
        ...(updates.domain && { domain: updates.domain }),
        ...(updates.categories && { categories: updates.categories }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.seo && { seo: updates.seo }),
        ...(updates.scheduledAt && { publishAt: updates.scheduledAt }),
      }
    });
  }

  async publishArticle(id: string, publishAt?: string) {
    return this.updateArticle(id, {
      status: 'published',
      publishedAt: publishAt || new Date().toISOString(),
    });
  }

  async deleteArticle(id: string) {
    const mutation = `
      mutation DeleteArticle($id: ID!) {
        deleteArticle(id: $id) {
          data {
            id
          }
        }
      }
    `;

    return this.client.request(mutation, { id });
  }

  // Services
  async getServices(domain?: string) {
    const query = `
      query GetServices($filters: ServiceFiltersInput) {
        services(
          filters: $filters
          sort: ["createdAt:desc"]
        ) {
          data {
            id
            attributes {
              title
              slug
              summary
              body
              domain
              typeTags
              heroImage {
                data {
                  attributes {
                    url
                  }
                }
              }
              seo {
                title
                description
                ogImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              publishedAt
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    return this.client.request(query, {
      filters: domain ? { domain: { eq: domain } } : undefined,
    });
  }

  async getService(slugOrId: string) {
    const query = `
      query GetService($slug: String, $id: ID) {
        services(
          filters: {
            or: [
              { slug: { eq: $slug } }
              { id: { eq: $id } }
            ]
          }
        ) {
          data {
            id
            attributes {
              title
              slug
              summary
              body
              domain
              typeTags
              heroImage {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              seo {
                title
                description
                ogImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              publishedAt
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, {
      slug: slugOrId,
      id: !isNaN(Number(slugOrId)) ? slugOrId : null,
    });

    return (result as any).services?.data?.[0] || null;
  }

  // Media Management
  async uploadMedia(file: File, metadata?: {
    alt?: string;
    caption?: string;
    folder?: string;
  }) {
    const formData = new FormData();
    formData.append('files', file);

    if (metadata) {
      formData.append('fileInfo', JSON.stringify({
        alternativeText: metadata.alt,
        caption: metadata.caption,
        folder: metadata.folder,
      }));
    }

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: this.token ? {
        Authorization: `Bearer ${this.token}`,
      } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Analytics & Engagement
  async incrementViewCount(articleId: string) {
    // Implement view tracking
    return this.client.request(`
      mutation IncrementView($id: ID!) {
        updateArticle(id: $id, data: { viewCount: increment }) {
          data {
            attributes {
              viewCount
            }
          }
        }
      }
    `, { id: articleId });
  }

  async toggleLike(articleId: string, userId: string) {
    // Implementation would depend on your like tracking strategy
    // This is a simplified version
    return this.client.request(`
      mutation ToggleLike($articleId: ID!, $userId: String!) {
        # Custom resolver for like toggling
      }
    `, { articleId, userId });
  }
}

// Singleton instance
export const cmsClient = new CMSClient();

// Convenience functions
export const fetchArticles = (filters?: Parameters<CMSClient['getArticles']>[0]) =>
  cmsClient.getArticles(filters);

export const fetchArticle = (slugOrId: string) =>
  cmsClient.getArticle(slugOrId);

export const fetchServices = (domain?: string) =>
  cmsClient.getServices(domain);

export const fetchService = (slugOrId: string) =>
  cmsClient.getService(slugOrId);

export const uploadMedia = (file: File, metadata?: Parameters<CMSClient['uploadMedia']>[1]) =>
  cmsClient.uploadMedia(file, metadata);

export default cmsClient;
