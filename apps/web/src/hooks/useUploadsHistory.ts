import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Schemas
const UploadFileSchema = z.object({
  r2Key: z.string(),
  filename: z.string().nullable().optional(),
  size: z.number().optional(),
  contentType: z.string().nullable().optional(),
});

const UploadItemSchema = z.object({
  id: z.string(),
  userExternalId: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  files: z.array(UploadFileSchema),
});

const UploadsResponseSchema = z.object({
  uploads: z.array(UploadItemSchema),
});

// Types inferred from schemas
export type UploadFile = z.infer<typeof UploadFileSchema>;
export type UploadItem = z.infer<typeof UploadItemSchema>;
export type UploadsResponse = z.infer<typeof UploadsResponseSchema>;

export function useUploadsHistory(authToken?: string) {
  return useQuery<UploadsResponse>({
    queryKey: ['uploads-history'],
    queryFn: async () => {
      const res = await fetch('/api/uploads', {
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
