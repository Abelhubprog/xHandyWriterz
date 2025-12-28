import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Loader2,
  RefreshCw,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { fetchArticles, fetchServices } from "@/lib/cms-client";
import { formatDate } from "@/lib/utils";

interface DraftSummary {
  id: string;
  title: string;
  updatedAt: string;
  domain?: string;
  status?: string;
}

interface ContentSummary {
  published: number;
  drafts: number;
  services: number;
}

const buildUrl = (base?: string, suffix?: string) => {
  if (!base) return "";
  const trimmed = base.replace(/\/$/, "");
  if (!suffix) return trimmed;
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${trimmed}${normalized}`;
};

const cmsBaseUrl = import.meta.env.VITE_CMS_URL || "";
const cmsAdminUrl = buildUrl(cmsBaseUrl, "/admin");
const mattermostUrl = buildUrl(import.meta.env.VITE_MATTERMOST_URL);
const uploadBrokerUrl = buildUrl(import.meta.env.VITE_UPLOAD_BROKER_URL);
const apiBaseUrl = buildUrl(import.meta.env.VITE_API_URL);
const apiRootUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;

export const AdminDashboard: React.FC = () => {
  const { user, isEditor } = useAuth();
  const [summary, setSummary] = useState<ContentSummary>({ published: 0, drafts: 0, services: 0 });
  const [recentDrafts, setRecentDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const envChecks = useMemo(() => [
    {
      label: "Strapi CMS",
      description: "Manage structured content, workflows, and previews.",
      href: cmsAdminUrl,
      present: Boolean(cmsAdminUrl),
    },
    {
      label: "Mattermost",
      description: "Operations and support messaging hub.",
      href: mattermostUrl,
      present: Boolean(mattermostUrl),
    },
    {
      label: uploadBrokerUrl ? "Upload Broker" : "Upload API",
      description: uploadBrokerUrl
        ? "Presigned uploads + antivirus pipeline for R2."
        : "Railway API fallback for presigned uploads.",
      href: uploadBrokerUrl || apiRootUrl,
      present: Boolean(uploadBrokerUrl || apiRootUrl),
    },
  ], []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [publishedRes, draftRes, servicesRes] = await Promise.all([
        fetchArticles({ status: "published", limit: 50 }),
        fetchArticles({ status: "draft", limit: 50 }),
        fetchServices(),
      ]);

      const publishedArticles = (publishedRes as any)?.articles?.data ?? [];
      const draftArticles = (draftRes as any)?.articles?.data ?? [];
      const services = (servicesRes as any)?.services?.data ?? [];

      setSummary({
        published: publishedArticles.length,
        drafts: draftArticles.length,
        services: services.length,
      });

      const normalizedDrafts: DraftSummary[] = draftArticles
        .map((item: any) => {
          const attrs = item.attributes ?? {};
          return {
            id: item.id ?? attrs.id ?? Math.random().toString(36).slice(2),
            title: attrs.title || "Untitled",
            updatedAt: attrs.updatedAt || attrs.createdAt || "",
            domain: attrs.domain,
            status: attrs.status,
          } satisfies DraftSummary;
        })
        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
        .slice(0, 6);

      setRecentDrafts(normalizedDrafts);
      setError(null);
    } catch (err) {
      console.error("[admin] Failed to load dashboard", err);
      setError("Unable to load CMS metrics. Verify VITE_CMS_URL and VITE_CMS_TOKEN.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditor) {
      loadDashboard();
    }
  }, [isEditor]);

  return (
    <>
      <Helmet>
        <title>Admin Control Center | HandyWriterz</title>
      </Helmet>

      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Control Center</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">Welcome back, {user?.firstName || user?.fullName || "Team"}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Monitor Strapi publishing, Mattermost operations, and the R2 file pipeline from one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDashboard} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh data
            </Button>
            {cmsAdminUrl && (
              <a
                href={cmsAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
              >
                Open Strapi
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="mt-1 text-red-600">
                Ensure the Strapi service is reachable and the dashboard has the correct API credentials.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Published articles
              </CardTitle>
              <Badge variant="outline" className="text-xs">live</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{summary.published}</p>
              <p className="mt-2 text-sm text-gray-500">Articles visible on the public site.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Drafts awaiting review
              </CardTitle>
              <Badge variant="secondary" className="text-xs">workflow</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{summary.drafts}</p>
              <p className="mt-2 text-sm text-gray-500">Review in Strapi before publishing.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Services catalog
              </CardTitle>
              <Badge variant="outline" className="text-xs">Strapi</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{summary.services}</p>
              <p className="mt-2 text-sm text-gray-500">Service pages currently maintained in Strapi.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <ShieldCheck className="h-4 w-4" /> Environment service health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {envChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{check.label}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-300">{check.description}</p>
                      </div>
                      <Badge
                        variant={check.present ? "default" : "destructive"}
                        className="flex items-center gap-1 text-xs"
                      >
                        {check.present ? (
                          <>
                            <CheckCircle className="h-3 w-3" /> Configured
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" /> Missing
                          </>
                        )}
                      </Badge>
                    </div>
                    {check.href && (
                      <a
                        href={check.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Open {check.label}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {!check.present && (
                      <p className="text-xs text-red-500">
                        Add the corresponding VITE_ environment variable so this surface is discoverable from the dashboard.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <MessageSquare className="h-4 w-4" /> Operations shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/admin/messaging"
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Mattermost console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/media/upload"
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Upload pipeline
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/turnitin-reports"
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Turnitin reviews
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <FileText className="h-4 w-4" /> Recent drafts
              </CardTitle>
              <Link to="/admin/content" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all drafts
              </Link>
            </CardHeader>
            <CardContent>
              {loading && recentDrafts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading drafts…
                </div>
              ) : recentDrafts.length === 0 ? (
                <p className="text-sm text-gray-500">No drafts in Strapi yet. Create one from the Strapi admin.</p>
              ) : (
                <div className="space-y-4">
                  {recentDrafts.map((draft) => (
                    <div key={draft.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{draft.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">{draft.status || "draft"}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-300">
                        <span>{draft.domain || "general"}</span>
                        {draft.updatedAt && <span>Updated {formatDate(draft.updatedAt)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
};

export default AdminDashboard;
