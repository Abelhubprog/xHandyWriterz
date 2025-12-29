/**
 * Preview Page
 * Displays draft content using preview tokens from admin
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { validatePreviewToken, fetchPreviewContent, type PreviewToken } from '@/lib/preview-tokens';
import RichContentRenderer from '@/components/Services/RichContentRenderer';
import { Info, Lock, Clock } from 'lucide-react';
import type { ServiceDetail } from '@/types/cms';

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<PreviewToken | null>(null);
  const [content, setContent] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('No preview token provided');
      setLoading(false);
      return;
    }

    const validated = validatePreviewToken(tokenParam);
    if (!validated) {
      setError('Invalid or expired preview token');
      setLoading(false);
      return;
    }

    setToken(validated);

    fetchPreviewContent(validated)
      .then((data) => {
        if (!data) {
          setError('Preview content not found');
        } else {
          setContent(data as ServiceDetail);
        }
      })
      .catch((err) => {
        console.error('Preview fetch error', err);
        setError('Failed to load preview content');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Helmet>
          <title>Loading Preview | HandyWriterz</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !token || !content) {
    return (
      <div className="container mx-auto py-12">
        <Helmet>
          <title>Preview Error | HandyWriterz</title>
        </Helmet>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Lock className="h-4 w-4" />
          <AlertTitle>Preview Unavailable</AlertTitle>
          <AlertDescription>{error || 'Unknown error occurred'}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <a href="/admin">
            <Button>Return to Admin</Button>
          </a>
        </div>
      </div>
    );
  }

  const expiresIn = token.expiresAt - Date.now();
  const expiresInMinutes = Math.floor(expiresIn / 60000);

  return (
    <div className="container mx-auto py-12">
      <Helmet>
        <title>Preview: {content.title || 'Draft'} | HandyWriterz</title>
      </Helmet>

      {/* Preview banner */}
      <Alert className="mb-8 border-primary bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Preview Mode</AlertTitle>
        <AlertDescription className="flex items-center gap-4">
          <span>
            You are viewing draft content. This preview is not publicly accessible.
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            Expires in {expiresInMinutes}m
          </span>
        </AlertDescription>
      </Alert>

      {/* Content preview */}
      <Card className="p-8">
        <header className="mb-8 border-b pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
              DRAFT
            </span>
            {content.domain && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {content.domain}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{content.title || 'Untitled'}</h1>
          {content.summary && (
            <p className="text-lg text-muted-foreground">{content.summary}</p>
          )}
        </header>

        {content.heroImageUrl && (
          <div className="mb-8">
            <img
              src={content.heroImageUrl}
              alt={content.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {content.body && (
          <div className="prose prose-lg max-w-none">
            <RichContentRenderer content={content.body} />
          </div>
        )}

        {content.attachments && content.attachments.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Attachments</h3>
            <div className="grid gap-4">
              {content.attachments.map((attachment, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{attachment.url}</p>
                    {attachment.sizeInBytes && (
                      <p className="text-sm text-muted-foreground">
                        {(attachment.sizeInBytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-center mt-6 gap-4">
        <a href="/admin">
          <Button variant="outline">Back to Admin</Button>
        </a>
        <a href={`/services/${content.domain}/${content.slug}`}>
          <Button>View Published (if available)</Button>
        </a>
      </div>
    </div>
  );
}
