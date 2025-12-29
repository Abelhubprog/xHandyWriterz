import { useCallback, useMemo, useRef, useState } from 'react';
import { resolveApiUrl } from '@/lib/api-base';

export type SubmissionStatus =
  | 'idle'
  | 'uploading'
  | 'submitting'
  | 'notifying'
  | 'success'
  | 'error'
  | 'partial';

type UseDocumentSubmissionOptions = {
  onSuccess?: (submissionId: string, attachments: UploadedAttachment[]) => void;
  onError?: (error: Error) => void;
};

export type UploadedAttachment = {
  r2Key: string;
  filename: string;
  size: number;
  contentType: string;
};

export function useDocumentSubmission(options: UseDocumentSubmissionOptions = {}) {
  const { onSuccess, onError } = options;

  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [submissionId, setSubmissionId] = useState<string>('');
  const abortControllersRef = useRef<AbortController[]>([]);
  const isCancelledRef = useRef<boolean>(false);

  const resetSubmission = useCallback(() => {
    setStatus('idle');
    setError(null);
    setSubmissionId('');
    isCancelledRef.current = false;
  }, []);

  const cancelSubmission = useCallback(() => {
    isCancelledRef.current = true;
    for (const controller of abortControllersRef.current) {
      try {
        controller.abort();
      } catch (abortError) {
        console.warn('Abort failed', abortError);
      }
    }
    abortControllersRef.current = [];
  }, []);

  const isSubmitting = useMemo(
    () => status === 'uploading' || status === 'submitting' || status === 'notifying',
    [status]
  );

  const submitDocuments = useCallback(
    async (files: File[], metadata: Record<string, unknown> = {}): Promise<UploadedAttachment[]> => {
      if (!files || files.length === 0) {
        return [];
      }

      setStatus('uploading');
      setError(null);
      isCancelledRef.current = false;
      abortControllersRef.current = [];

      const localSubmissionId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setSubmissionId(localSubmissionId);

      let nextSubmissionId = localSubmissionId;
      const uploaded: UploadedAttachment[] = [];

      try {
        const presignEndpoint = resolveApiUrl('/api/uploads/presign-put');

        for (const file of files) {
          if (isCancelledRef.current) {
            throw new Error('Upload cancelled');
          }

          const controller = new AbortController();
          abortControllersRef.current.push(controller);

          const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
          const key = `submissions/${localSubmissionId}/${safeName}`;

          const presignRes = await fetch(presignEndpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
            signal: controller.signal,
          });

          if (!presignRes.ok) {
            const text = await presignRes.text().catch(() => '');
            throw new Error(`Failed to get upload URL: ${text}`);
          }

          const presign = await presignRes.json();
          if (!presign.url) {
            throw new Error('Invalid upload presign response');
          }

          const putController = new AbortController();
          abortControllersRef.current.push(putController);

          const putRes = await fetch(presign.url, {
            method: 'PUT',
            headers: {
              'content-type': file.type || 'application/octet-stream',
            },
            body: file,
            signal: putController.signal,
          });

          if (!putRes.ok) {
            const text = await putRes.text().catch(() => '');
            throw new Error(`Failed to upload file to storage: ${text}`);
          }

          uploaded.push({
            r2Key: key,
            filename: file.name,
            size: file.size,
            contentType: file.type || 'application/octet-stream',
          });
        }

        setStatus('submitting');

        try {
          const persistRes = await fetch(resolveApiUrl('/api/uploads'), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ attachments: uploaded, metadata }),
          });

          if (persistRes.ok) {
            const persisted = await persistRes.json().catch(() => ({} as { uploadId?: string }));
            if (persisted && persisted.uploadId) {
              nextSubmissionId = persisted.uploadId;
              setSubmissionId(persisted.uploadId);
            }
          }
        } catch (persistError) {
          console.warn('Persist step failed', persistError);
        }

        setStatus('notifying');

        const metadataRecord = metadata as Record<string, unknown>;
        const email =
          (metadataRecord.userEmail as string | undefined) ??
          (metadataRecord.email as string | undefined) ??
          '';

        if (email) {
          const notifyRes = await fetch(resolveApiUrl('/api/turnitin/notify'), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orderId: nextSubmissionId, email, attachments: uploaded }),
          });

          if (!notifyRes.ok) {
            const text = await notifyRes.text().catch(() => '');
            const notifyError = new Error(`Uploaded, but failed to notify admin: ${text}`);
            setStatus('partial');
            setError(notifyError);
            onError?.(notifyError);
            return uploaded;
          }

          try {
            await fetch(resolveApiUrl('/api/turnitin/receipt'), {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ orderId: nextSubmissionId, email }),
            });
          } catch (receiptError) {
            console.warn('Receipt notification failed', receiptError);
          }
        }

        setStatus('success');
        onSuccess?.(nextSubmissionId, [...uploaded]);
        return uploaded;
      } catch (caught) {
        const err = caught instanceof Error ? caught : new Error(String(caught));
        setError(err);
        setStatus('error');
        onError?.(err);
        throw err;
      }
    },
    [onError, onSuccess]
  );

  return {
    submitDocuments,
    cancelSubmission,
    resetSubmission,
    isSubmitting,
    status,
    error,
    submissionId,
  } as const;
}

export default useDocumentSubmission;
