import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from '@/components/ui/Loader';
import { toast } from 'react-hot-toast';
import { resolveApiUrl } from '@/lib/api-base';

// Uploads flow uses the presign service that issues R2 uploads.
interface UploadDropzoneProps {
  onUpload: () => void;
}

export function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        if (file.size > 200 * 1024 * 1024) {
          toast.error('File too large. Maximum file size is 200MB for video and 20MB for other formats.');
          continue;
        }

        const presignRes = await fetch(resolveApiUrl('/api/upload-url'), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ contentType: file.type, filename: file.name, size: file.size }),
        });
        if (!presignRes.ok) throw new Error('Failed to presign upload');
        const { uploadUrl } = await presignRes.json();

        const putRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } });
        if (putRes.ok) {
          onUpload();
          toast.success(`${file.name} uploaded successfully.`);
        } else {
          toast.error('Failed to upload file.');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }, [onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  return (
    <Card {...getRootProps()} className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <CardContent className="space-y-4">
        <input {...getInputProps()} />
        {uploading ? (
          <Loader size="lg" />
        ) : isDragActive ? (
          <p className="text-gray-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-gray-600">Drag & drop files here, or click to select</p>
            <p className="text-sm text-gray-500">Supports images, video (max 200MB), audio (max 20MB), documents (max 20MB)</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
