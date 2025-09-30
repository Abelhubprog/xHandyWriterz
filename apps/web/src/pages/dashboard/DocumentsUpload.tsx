import React, { useCallback, useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Upload, Trash2, Download, Copy, Info } from 'lucide-react';
import { env } from '@/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MAX_FILES = 10;
const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt', '.jpg', '.jpeg', '.png', '.mp4', '.mov', '.m4a', '.mp3', '.wav'];

type UploadedItem = {
  key: string;
  name: string;
  size: number;
  uploadedAt: string;
};

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9_.-]/g, '_');
const formatBytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const DocumentsUpload: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const brokerUrl = useMemo(() => env.VITE_UPLOAD_BROKER_URL?.replace(/\/$/, '') ?? '', []);

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const handleFiles = useCallback((files: File[]) => {
    if (!files.length) return;

    const invalid = files.filter((file) => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return !ACCEPTED_TYPES.includes(ext) && !ACCEPTED_TYPES.includes('*');
    });

    if (invalid.length) {
      toast.error(`Unsupported file type. Allowed: ${ACCEPTED_TYPES.join(', ')}`);
      return;
    }

    const tooLarge = files.filter((file) => file.size > MAX_SIZE_BYTES);
    if (tooLarge.length) {
      toast.error(`Some files exceed the ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    setSelectedFiles((current) => {
      const combined = [...current, ...files];
      if (combined.length > MAX_FILES) {
        toast.error(`You can upload up to ${MAX_FILES} files at once.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const onInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
      event.target.value = '';
    }
  }, [handleFiles]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      handleFiles(Array.from(event.dataTransfer.files));
    }
  }, [handleFiles]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((current) => current.filter((_, idx) => idx !== index));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (!brokerUrl) {
      toast.error('Upload broker URL is not configured. Set VITE_UPLOAD_BROKER_URL.');
      return;
    }
    if (!selectedFiles.length) {
      toast.error('Select at least one file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      for (const file of selectedFiles) {
        const safeName = sanitizeFileName(file.name);
        const userSegment = user?.id ? `users/${user.id}` : 'anonymous';
        const key = `${userSegment}/${Date.now()}-${safeName}`;

        const presignRes = await fetch(`${brokerUrl}/s3/presign-put`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
        });

        if (!presignRes.ok) {
          const text = await presignRes.text().catch(() => '');
          throw new Error(text || 'Failed to presign upload');
        }

        const { url } = await presignRes.json();
        if (!url) throw new Error('Upload URL missing from broker response');

        const putRes = await fetch(url, {
          method: 'PUT',
          headers: { 'content-type': file.type || 'application/octet-stream' },
          body: file,
        });

        if (!putRes.ok) {
          const text = await putRes.text().catch(() => '');
          throw new Error(text || 'Upload to R2 failed');
        }

        setUploads((current) => [
          { key, name: file.name, size: file.size, uploadedAt: new Date().toISOString() },
          ...current,
        ]);
      }

      setSelectedFiles([]);
      toast.success('Upload complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload files';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [brokerUrl, selectedFiles, user?.id]);

  const handleDownload = useCallback(async (key: string) => {
    if (!brokerUrl) return;
    try {
      const res = await fetch(`${brokerUrl}/s3/presign`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to presign download');
      }
      const { url } = await res.json();
      if (url) {
        window.open(url, '_blank', 'noopener');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open download link';
      toast.error(message);
    }
  }, [brokerUrl]);

  const handleCopyLink = useCallback(async (key: string) => {
    if (!brokerUrl) return;
    try {
      const res = await fetch(`${brokerUrl}/s3/presign`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to presign download');
      }
      const { url } = await res.json();
      if (url) {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to copy link';
      toast.error(message);
    }
  }, [brokerUrl]);

  return (
    <>
      <Helmet>
        <title>Document Upload · HandyWriterz</title>
      </Helmet>

      <div className="container mx-auto space-y-6 py-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Upload files securely to Cloudflare R2. Links are presigned on demand and remain private unless shared.
          </p>
        </header>

        {!brokerUrl && (
          <Alert className="border-yellow-400 bg-yellow-50 text-yellow-800">
            <AlertTitle>Upload broker unavailable</AlertTitle>
            <AlertDescription>
              Set <code>VITE_UPLOAD_BROKER_URL</code> in your environment so the dashboard can request presigned upload URLs.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload files</CardTitle>
            <CardDescription>
              Supported formats: {ACCEPTED_TYPES.join(', ')}. Maximum size per file: {MAX_SIZE_MB} MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
              } ${!brokerUrl ? 'opacity-60' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              role="button"
              tabIndex={0}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Drag and drop files here, or choose from your computer.
              </p>
              <input
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                onChange={onInputChange}
                className="hidden"
                id="document-upload-input"
                disabled={!brokerUrl}
              />
              <Button
                type="button"
                className="mt-4"
                onClick={() => document.getElementById('document-upload-input')?.click()}
                disabled={!brokerUrl}
              >
                Select files
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Selected files ({selectedFiles.length})</h3>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                    Clear all
                  </Button>
                </div>
                <ul className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded border p-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button onClick={uploadFiles} disabled={!brokerUrl || isUploading}>
                  {isUploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent uploads</CardTitle>
            <CardDescription>
              Session-scoped list of uploads. Download links expire after a few minutes and can be regenerated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 ? (
              <div className="flex items-center gap-3 rounded border border-dashed p-4 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                Upload files to see them listed here.
              </div>
            ) : (
              <ul className="space-y-3">
                {uploads.map((item) => (
                  <li key={item.key} className="rounded border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(item.size)} · Uploaded {new Date(item.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(item.key)}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCopyLink(item.key)}>
                          <Copy className="mr-2 h-4 w-4" /> Copy link
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground break-all">{item.key}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DocumentsUpload;
