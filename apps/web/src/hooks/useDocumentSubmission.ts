import { useCallback, useMemo, useRef, useState } from 'react';
import { env } from '@/env';

export type SubmissionStatus =
  | 'idle'
  | 'uploading'
  | 'submitting'
  | 'notifying'
  | 'success'
  | 'error'
  | 'partial';

type UseDocumentSubmissionOptions = {
  onSuccess?: (submissionId: string) => void;
  onError?: (error: Error) => void;
};

type UploadedAttachment = {
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
    for (const c of abortControllersRef.current) {
      try {
        c.abort();
      } catch {}
    }
    abortControllersRef.current = [];
  }, []);

  const isSubmitting = useMemo(() => status === 'uploading' || status === 'submitting' || status === 'notifying', [status]);

  const submitDocuments = useCallback(async (files: File[], metadata: Record<string, any> = {}) => {
    if (!files || files.length === 0) return;

    setStatus('uploading');
    setError(null);
    isCancelledRef.current = false;
    abortControllersRef.current = [];

    const localSubmissionId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setSubmissionId(localSubmissionId);

    const uploaded: UploadedAttachment[] = [];

    try {
      // 1) For each file, request presigned PUT from upload-broker, then upload to R2
      const brokerUrl = env.VITE_UPLOAD_BROKER_URL?.replace(/\/$/, '') ?? '';
      if (!brokerUrl) throw new Error('Upload broker not configured. Set VITE_UPLOAD_BROKER_URL');
      for (const file of files) {
        if (isCancelledRef.current) throw new Error('Upload cancelled');

        const controller = new AbortController();
        abortControllersRef.current.push(controller);

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const key = `submissions/${localSubmissionId}/${safeName}`;
        const presignRes = await fetch(`${brokerUrl}/s3/presign-put`, {
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

      // 2) Persist upload batch to backend (Mattermost/Strapi backend pipeline)
      setStatus('submitting');
      try {
        const persistRes = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ attachments: uploaded, metadata }),
        });
        if (persistRes.ok) {
          const pj = await persistRes.json().catch(() => ({} as any));
          if (pj && pj.uploadId) {
            setSubmissionId(pj.uploadId);
          }
        }
      } catch {}

      // 3) Notify admin (and optionally user) with the uploaded attachment list
      setStatus('notifying');

      const email = metadata.userEmail || metadata.email || '';
      if (email) {
        // Inform admin
        const notifyRes = await fetch('/api/turnitin/notify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderId: localSubmissionId, email, attachments: uploaded }),
        });

        if (!notifyRes.ok) {
          // If upload succeeded but notify failed, report partial
          setStatus('partial');
          const text = await notifyRes.text();
          const err = new Error(`Uploaded, but failed to notify admin: ${text}`);
          setError(err);
          onError?.(err);
          return;
        }

        // Send user receipt (best-effort)
        try {
          await fetch('/api/turnitin/receipt', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orderId: localSubmissionId, email }),
          });
        } catch {}
      }

      setStatus('success');
  onSuccess?.(submissionId || localSubmissionId);
    } catch (e: any) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setStatus(isCancelledRef.current ? 'error' : 'error');
      onError?.(err);
    }
  }, [onError, onSuccess]);

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
