/**
 * Compliance Checklist Component (F-085)
 * 
 * Pre-publication checklist to ensure content meets educational
 * and legal compliance requirements before going live.
 * 
 * Features:
 * - Required fields validation
 * - SEO completeness check
 * - Accessibility validation
 * - Legal review status
 * - Educational standards compliance
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ComplianceCheckItem {
  id: string;
  label: string;
  description?: string;
  category: 'required' | 'seo' | 'accessibility' | 'legal' | 'educational';
  autoCheck?: (content: any) => boolean;
  required: boolean;
}

export interface ComplianceStatus {
  passed: number;
  failed: number;
  total: number;
  isCompliant: boolean;
}

export interface ComplianceChecklistProps {
  content: any;
  onStatusChange?: (status: ComplianceStatus) => void;
  onPublish?: () => void;
  publishDisabled?: boolean;
}

const COMPLIANCE_CHECKS: ComplianceCheckItem[] = [
  // Required Fields
  {
    id: 'title',
    label: 'Title is present and descriptive',
    category: 'required',
    autoCheck: (content) => Boolean(content.title && content.title.length >= 10),
    required: true,
  },
  {
    id: 'summary',
    label: 'Summary is present',
    category: 'required',
    autoCheck: (content) => Boolean(content.summary),
    required: true,
  },
  {
    id: 'body',
    label: 'Body content is present and substantial',
    category: 'required',
    autoCheck: (content) => Boolean(content.body && content.body.length >= 100),
    required: true,
  },
  {
    id: 'domain',
    label: 'Content is assigned to a domain',
    category: 'required',
    autoCheck: (content) => Boolean(content.domain),
    required: true,
  },

  // SEO
  {
    id: 'seo-title',
    label: 'SEO title is optimized (50-60 characters)',
    category: 'seo',
    autoCheck: (content) =>
      Boolean(content.seo?.title && content.seo.title.length >= 50 && content.seo.title.length <= 60),
    required: false,
  },
  {
    id: 'seo-description',
    label: 'Meta description is present (150-160 characters)',
    category: 'seo',
    autoCheck: (content) =>
      Boolean(
        content.seo?.metaDescription &&
          content.seo.metaDescription.length >= 150 &&
          content.seo.metaDescription.length <= 160
      ),
    required: false,
  },
  {
    id: 'seo-image',
    label: 'Social sharing image (OpenGraph) is present',
    category: 'seo',
    autoCheck: (content) => Boolean(content.seo?.ogImage || content.heroImageUrl),
    required: false,
  },

  // Accessibility
  {
    id: 'alt-text',
    label: 'All images have alt text',
    description: 'Verify manually that all images include descriptive alt text',
    category: 'accessibility',
    required: true,
  },
  {
    id: 'headings',
    label: 'Content uses proper heading hierarchy',
    description: 'H1 → H2 → H3 without skipping levels',
    category: 'accessibility',
    required: false,
  },
  {
    id: 'links',
    label: 'All links have descriptive text (no "click here")',
    category: 'accessibility',
    required: false,
  },

  // Legal
  {
    id: 'copyright',
    label: 'All media has proper licensing/attribution',
    description: 'Verify copyright compliance for images, videos, and quoted text',
    category: 'legal',
    required: true,
  },
  {
    id: 'privacy',
    label: 'No personally identifiable information (PII) disclosed',
    description: 'Check for student names, addresses, or other private data',
    category: 'legal',
    required: true,
  },
  {
    id: 'claims',
    label: 'All factual claims are cited and verifiable',
    category: 'legal',
    required: true,
  },

  // Educational Standards
  {
    id: 'accuracy',
    label: 'Content is factually accurate and up-to-date',
    category: 'educational',
    required: true,
  },
  {
    id: 'citations',
    label: 'Academic citations follow proper format',
    description: 'APA, MLA, or Chicago style as appropriate',
    category: 'educational',
    required: false,
  },
  {
    id: 'readability',
    label: 'Content matches target audience reading level',
    description: 'Appropriate complexity for intended students/professionals',
    category: 'educational',
    required: false,
  },
];

export function ComplianceChecklist({
  content,
  onStatusChange,
  onPublish,
  publishDisabled = false,
}: ComplianceChecklistProps) {
  const [manualChecks, setManualChecks] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const checkStatus = (check: ComplianceCheckItem): boolean => {
    if (check.autoCheck) {
      return check.autoCheck(content);
    }
    return manualChecks.has(check.id);
  };

  const toggleManualCheck = (checkId: string) => {
    setManualChecks((prev) => {
      const next = new Set(prev);
      if (next.has(checkId)) {
        next.delete(checkId);
      } else {
        next.add(checkId);
      }
      return next;
    });
  };

  const status: ComplianceStatus = COMPLIANCE_CHECKS.reduce<ComplianceStatus>(
    (acc, check) => {
      const passed = checkStatus(check);
      return {
        passed: acc.passed + (passed ? 1 : 0),
        failed: acc.failed + (!passed ? 1 : 0),
        total: acc.total + 1,
        isCompliant: acc.isCompliant && (passed || !check.required),
      };
    },
    { passed: 0, failed: 0, total: 0, isCompliant: true }
  );

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [manualChecks, content]);

  const categoryGroups = COMPLIANCE_CHECKS.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, ComplianceCheckItem[]>);

  const categoryLabels: Record<string, string> = {
    required: 'Required Fields',
    seo: 'SEO & Discoverability',
    accessibility: 'Accessibility',
    legal: 'Legal Compliance',
    educational: 'Educational Standards',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Compliance Checklist</h3>
      </div>

      {/* Status summary */}
      <Alert className={status.isCompliant ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
        {status.isCompliant ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        )}
        <AlertTitle>
          {status.isCompliant ? 'Ready to Publish' : 'Compliance Checks Needed'}
        </AlertTitle>
        <AlertDescription>
          {status.passed} of {status.total} checks passed
          {!status.isCompliant && ' — Complete all required checks before publishing'}
        </AlertDescription>
      </Alert>

      {/* Toggle details button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 w-full"
      >
        {showDetails ? 'Hide' : 'Show'} Checklist Details
      </Button>

      {/* Checklist details */}
      {showDetails && (
        <div className="mt-4 space-y-4">
          {Object.entries(categoryGroups).map(([category, checks]) => (
            <div key={category} className="border-t pt-4">
              <h4 className="font-medium mb-3">{categoryLabels[category]}</h4>
              <div className="space-y-2">
                {checks.map((check) => {
                  const passed = checkStatus(check);
                  const isAuto = Boolean(check.autoCheck);

                  return (
                    <div key={check.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                      {isAuto ? (
                        <div className="pt-1">
                          {passed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      ) : (
                        <Checkbox
                          checked={manualChecks.has(check.id)}
                          onCheckedChange={() => toggleManualCheck(check.id)}
                        />
                      )}
                      <div className="flex-1">
                        <label className="text-sm font-medium flex items-center gap-2">
                          {check.label}
                          {check.required && (
                            <span className="text-xs text-red-600 font-bold">*</span>
                          )}
                        </label>
                        {check.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {check.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={onPublish}
          disabled={!status.isCompliant || publishDisabled}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Publish Content
        </Button>
      </div>
    </Card>
  );
}
