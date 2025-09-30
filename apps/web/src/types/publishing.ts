import { z } from 'zod';

// Content block types for rich publishing
export const ContentBlockType = z.enum([
  'paragraph',
  'heading',
  'code',
  'image',
  'video',
  'audio',
  'embed',
  'quote',
  'list',
  'table',
  'math',
  'callout',
  'divider',
  'gallery'
]);

export const ContentBlock = z.object({
  id: z.string(),
  type: ContentBlockType,
  content: z.record(z.any()), // Flexible content based on block type
  metadata: z.record(z.any()).optional(),
  order: z.number(),
  styles: z.record(z.any()).optional(),
});

// Rich article schema for enterprise publishing
export const Article = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string().optional(),
  content: z.array(ContentBlock), // Rich block-based content

  // Publishing metadata
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),

  // SEO & Social
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    twitterCard: z.enum(['summary', 'summary_large_image']).optional(),
  }).optional(),

  // Categorization
  domain: z.string(), // adult-health, mental-health, etc.
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Media & Assets
  heroImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),

  // Authoring
  authorId: z.string(),
  contributors: z.array(z.string()).default([]),
  reviewers: z.array(z.string()).default([]),

  // Analytics
  viewCount: z.number().default(0),
  likeCount: z.number().default(0),
  shareCount: z.number().default(0),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Version control
  version: z.number().default(1),
  isLatest: z.boolean().default(true),
});

// Service page schema for enterprise content
export const Service = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  domain: z.string(),

  // Rich content sections
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
    video: z.string().optional(),
    cta: z.object({
      text: z.string(),
      url: z.string(),
    }).optional(),
  }),

  sections: z.array(z.object({
    id: z.string(),
    type: z.enum(['content', 'features', 'pricing', 'testimonials', 'faq', 'gallery']),
    title: z.string().optional(),
    content: z.array(ContentBlock),
    settings: z.record(z.any()).optional(),
  })),

  // Publishing
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.string().datetime().optional(),

  // SEO
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
  }).optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Editor state for real-time collaboration
export const EditorState = z.object({
  documentId: z.string(),
  content: z.array(ContentBlock),
  selection: z.object({
    blockId: z.string(),
    offset: z.number(),
  }).optional(),
  collaborators: z.array(z.object({
    userId: z.string(),
    name: z.string(),
    cursor: z.object({
      blockId: z.string(),
      offset: z.number(),
    }).optional(),
  })),
  lastSaved: z.string().datetime(),
  hasChanges: z.boolean().default(false),
});

// Comment and annotation system
export const Comment = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),

  // Context
  documentId: z.string(),
  blockId: z.string().optional(), // Block-level comments
  selection: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(), // Text selection comments

  // Threading
  parentId: z.string().optional(),
  replies: z.array(z.string()).default([]),

  // Status
  status: z.enum(['active', 'resolved', 'archived']),
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Export types
export type ContentBlockType = z.infer<typeof ContentBlockType>;
export type ContentBlock = z.infer<typeof ContentBlock>;
export type Article = z.infer<typeof Article>;
export type Service = z.infer<typeof Service>;
export type EditorState = z.infer<typeof EditorState>;
export type Comment = z.infer<typeof Comment>;
