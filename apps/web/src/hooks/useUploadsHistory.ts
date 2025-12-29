import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { resolveApiUrl } from '@/lib/api-base';

// Schemas
const UploadItemSchema = z.object({
  key: z.string(),
  filename: z.string().optional(),
  contentType: z.string().optional(),
  size: z.number().optional(),
  userId: z.string(),
  submissionId: z.string().optional(),
  uploadedAt: z.string().optional(),
});

const UploadsResponseSchema = z.object({
  uploads: z.array(UploadItemSchema),
});

// Types inferred from schemas
export type UploadItem = z.infer<typeof UploadItemSchema>;
export type UploadsResponse = z.infer<typeof UploadsResponseSchema>;

export function useUploadsHistory(authToken?: string) {
  return useQuery<UploadsResponse>({
    queryKey: ['uploads-history'],
    queryFn: async () => {
      const res = await fetch(resolveApiUrl('/api/uploads/history'), {
        method: 'GET',
        headers: { 'accept': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to fetch uploads: ${res.status}`);
      }
      const json = await res.json();
      return UploadsResponseSchema.parse(json);
    },
    staleTime: 30_000,
  });
}
