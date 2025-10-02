/**
 * Content Version History Component (F-045)
 * 
 * Displays version history for Strapi content entries with diff view
 * and one-click rollback functionality.
 * 
 * Features:
 * - Fetches version history from Strapi
 * - Displays diff between versions
 * - One-click rollback to previous version
 * - Version metadata (author, timestamp, changes summary)
 */

import React, { useState, useEffect } from 'react';
import { History, RotateCcw, Eye, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { env } from '@/env';

export interface ContentVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
  data: Record<string, any>;
  changesSummary?: string;
}

export interface VersionHistoryProps {
  contentType: 'service' | 'article';
  contentId: string;
  onRestore?: (versionId: string) => void;
}

async function fetchVersionHistory(
  contentType: string,
  contentId: string
): Promise<ContentVersion[]> {
  const cmsUrl = env.VITE_CMS_URL;
  const cmsToken = env.VITE_CMS_TOKEN;

  if (!cmsUrl || !cmsToken) {
    throw new Error('CMS configuration missing');
  }

  const response = await fetch(
    `${cmsUrl}/api/${contentType}s/${contentId}/versions`,
    {
      headers: {
        'Authorization': `Bearer ${cmsToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch version history: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function restoreVersion(
  contentType: string,
  contentId: string,
  versionId: string
): Promise<boolean> {
  const cmsUrl = env.VITE_CMS_URL;
  const cmsToken = env.VITE_CMS_TOKEN;

  if (!cmsUrl || !cmsToken) {
    throw new Error('CMS configuration missing');
  }

  const response = await fetch(
    `${cmsUrl}/api/${contentType}s/${contentId}/restore`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cmsToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ versionId }),
    }
  );

  return response.ok;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function calculateDiff(current: Record<string, any>, previous: Record<string, any>): string[] {
  const changes: string[] = [];
  const allKeys = new Set([...Object.keys(current), ...Object.keys(previous)]);

  allKeys.forEach((key) => {
    if (current[key] !== previous[key]) {
      changes.push(key);
    }
  });

  return changes;
}

export function VersionHistoryPanel({ contentType, contentId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchVersionHistory(contentType, contentId)
      .then(setVersions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [contentType, contentId]);

  const handleRestore = async (versionId: string) => {
    if (!window.confirm('Are you sure you want to restore this version? This will create a new version with the restored content.')) {
      return;
    }

    setRestoring(versionId);
    try {
      const success = await restoreVersion(contentType, contentId, versionId);
      if (success) {
        // Refresh version history
        const updatedVersions = await fetchVersionHistory(contentType, contentId);
        setVersions(updatedVersions);
        
        if (onRestore) {
          onRestore(versionId);
        }
      } else {
        alert('Failed to restore version');
      }
    } catch (err) {
      alert(`Error restoring version: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRestoring(null);
    }
  };

  const toggleExpanded = (versionId: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Version History</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Version History</h3>
        </div>
        <p className="text-sm text-muted-foreground">No version history available.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Version History</h3>
        <span className="text-sm text-muted-foreground">({versions.length} versions)</span>
      </div>

      <div className="space-y-3">
        {versions.map((version, idx) => {
          const isExpanded = expandedVersions.has(version.id);
          const isCurrent = idx === 0;
          const previousVersion = idx < versions.length - 1 ? versions[idx + 1] : null;
          const changes = previousVersion
            ? calculateDiff(version.data, previousVersion.data)
            : [];

          return (
            <div
              key={version.id}
              className={`border rounded-lg p-4 ${isCurrent ? 'border-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleExpanded(version.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="font-medium">Version {version.versionNumber}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(version.createdAt)} by {version.createdBy.username}
                  </p>
                  {version.changesSummary && (
                    <p className="text-sm text-muted-foreground pl-6 mt-1">
                      {version.changesSummary}
                    </p>
                  )}
                  {changes.length > 0 && (
                    <p className="text-xs text-muted-foreground pl-6 mt-1">
                      Changed: {changes.join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(version.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.id)}
                      disabled={restoring === version.id}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      {restoring === version.id ? 'Restoring...' : 'Restore'}
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pl-6 border-l-2 border-muted">
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(version.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
