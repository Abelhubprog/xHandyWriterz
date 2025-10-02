/**
 * Microfeed to Strapi Migration Script
 * Imports legacy Microfeed JSON content into Strapi 5
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MicrofeedService {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  domain: string;
  typeTags?: string[];
  content: string;
  heroImage?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StrapiService {
  title: string;
  slug: string;
  summary?: string;
  body: string;
  domain: string;
  typeTags?: string[];
  publishedAt?: string;
  heroImage?: number;
  attachments?: number[];
}

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const MICROFEED_DATA_PATH = process.env.MICROFEED_DATA_PATH || path.join(__dirname, '../../microfeed-export.json');
const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  console.log('🚀 Starting Microfeed → Strapi migration');
  console.log(`📂 Reading from: ${MICROFEED_DATA_PATH}`);
  console.log(`🎯 Target Strapi: ${STRAPI_URL}`);
  console.log(`🏃 Dry run: ${DRY_RUN ? 'YES' : 'NO'}\n`);

  if (!fs.existsSync(MICROFEED_DATA_PATH)) {
    console.error(`❌ Microfeed data file not found: ${MICROFEED_DATA_PATH}`);
    console.log('💡 Create an export file with: pnpm run export-microfeed');
    process.exit(1);
  }

  const microfeedData: MicrofeedService[] = JSON.parse(fs.readFileSync(MICROFEED_DATA_PATH, 'utf-8'));
  console.log(`📊 Found ${microfeedData.length} services to migrate\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const service of microfeedData) {
    try {
      console.log(`\n📝 Processing: ${service.title} (${service.slug})`);

      // Check if already exists
      const existing = await findExistingService(service.slug);
      if (existing) {
        console.log(`  ⏭️  Already exists in Strapi (ID: ${existing.id}), skipping`);
        skipped++;
        continue;
      }

      // Map to Strapi format
      const strapiService = await mapToStrapiService(service);

      if (DRY_RUN) {
        console.log(`  🔍 [DRY RUN] Would create:`, JSON.stringify(strapiService, null, 2));
        imported++;
      } else {
        const created = await createStrapiService(strapiService);
        console.log(`  ✅ Created successfully (ID: ${created.id})`);
        imported++;
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${service.slug}:`, error);
      errors++;
    }
  }

  console.log(`\n\n📊 Migration Summary:`);
  console.log(`  ✅ Imported: ${imported}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  📋 Total: ${microfeedData.length}`);

  if (DRY_RUN) {
    console.log(`\n💡 This was a DRY RUN. Run without DRY_RUN=true to apply changes.`);
  } else {
    console.log(`\n✨ Migration complete!`);
  }
}

async function findExistingService(slug: string): Promise<{ id: number } | null> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/services?filters[slug][$eq]=${encodeURIComponent(slug)}`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check existing service: ${response.status}`);
    }

    const data = await response.json();
    return data.data && data.data.length > 0 ? { id: data.data[0].id } : null;
  } catch (error) {
    console.warn(`  ⚠️  Error checking for existing service:`, error);
    return null;
  }
}

async function mapToStrapiService(mf: MicrofeedService): Promise<StrapiService> {
  // Upload hero image if present
  let heroImageId: number | undefined;
  if (mf.heroImage) {
    heroImageId = await uploadMedia(mf.heroImage, `${mf.slug}-hero`);
  }

  // Upload attachments
  let attachmentIds: number[] = [];
  if (mf.attachments && mf.attachments.length > 0) {
    for (const attachment of mf.attachments) {
      try {
        const id = await uploadMedia(attachment.url, attachment.name);
        if (id) attachmentIds.push(id);
      } catch (error) {
        console.warn(`  ⚠️  Failed to upload attachment ${attachment.name}:`, error);
      }
    }
  }

  return {
    title: mf.title,
    slug: mf.slug,
    summary: mf.summary,
    body: mf.content,
    domain: mf.domain,
    typeTags: mf.typeTags,
    publishedAt: mf.publishedAt || mf.createdAt || new Date().toISOString(),
    heroImage: heroImageId,
    attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
  };
}

async function uploadMedia(url: string, filename: string): Promise<number | undefined> {
  try {
    console.log(`    📤 Uploading: ${filename}`);

    // Download the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const blob = await response.blob();
    const formData = new FormData();
    formData.append('files', blob, filename);

    // Upload to Strapi
    const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    const fileId = uploadData[0]?.id;
    console.log(`    ✅ Uploaded (ID: ${fileId})`);
    return fileId;
  } catch (error) {
    console.error(`    ❌ Upload failed for ${filename}:`, error);
    return undefined;
  }
}

async function createStrapiService(data: StrapiService): Promise<{ id: number }> {
  const response = await fetch(`${STRAPI_URL}/api/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create service: ${response.status} ${error}`);
  }

  const result = await response.json();
  return { id: result.data.id };
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
