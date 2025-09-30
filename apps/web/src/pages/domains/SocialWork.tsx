import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
	Search,
	Filter,
	Grid,
	List,
	Eye,
	Heart,
	MessageCircle,
	BarChart3,
	Users,
	Tag,
	Layers,
	Calendar,
	Hash,
	RefreshCw,
	Settings,
	Database,
	ArrowRight,
	ChevronDown,
	ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { fetchServicesList } from '@/lib/cms';
import { CMSClient } from '@/lib/cms-client';
import { DOMAIN_TAGS, TYPE_TAGS } from '@/config/taxonomy';

const cmsClient = new CMSClient();

type ArticleNode = {
	id: string;
	attributes: {
		title: string;
		slug: string;
		summary?: string | null;
		content?: unknown;
		domain: string;
		categories?: string[] | null;
		tags?: string[] | null;
		status: string;
		publishedAt?: string | null;
		viewCount?: number | null;
		likeCount?: number | null;
		shareCount?: number | null;
		heroImage?: { data?: { attributes?: { url?: string | null; alternativeText?: string | null } | null } | null } | null;
		author?: { data?: { attributes?: { firstname?: string; lastname?: string; email?: string } } } | null;
		createdAt?: string;
		updatedAt?: string;
	};
};

type ServiceItem = {
	id: string;
	slug: string;
	title: string;
	summary: string | null;
	domain: string | null;
	typeTags: string[];
	heroImageUrl: string | null;
	publishedAt: string | null;
	readingMinutes: number | null;
	authorName: string | null;
};

type Combined = {
	kind: 'article' | 'service';
	id: string;
	title: string;
	slug: string;
	summary: string | null;
	domain: string;
	tags: string[];
	categories: string[];
	publishedAt: string | null;
	viewCount: number;
	likeCount: number;
	shareCount: number;
	heroImage: string | null;
	author: string;
	readingMinutes: number | null;
};

const DOMAIN_SLUG = 'social-work';
const DOMAIN_META = DOMAIN_TAGS.find(d => d.slug === DOMAIN_SLUG)!; // domain exists in taxonomy

const SORT_OPTIONS = [
	'publishedAt:desc',
	'publishedAt:asc',
	'viewCount:desc',
	'likeCount:desc',
	'title:asc',
	'title:desc'
] as const;

type SortValue = typeof SORT_OPTIONS[number];

const TIMEFRAMES: Array<{ key: string; label: string; days: number | null }> = [
	{ key: 'all', label: 'All time', days: null },
	{ key: '7d', label: 'Last 7d', days: 7 },
	{ key: '30d', label: 'Last 30d', days: 30 },
	{ key: '90d', label: 'Last 90d', days: 90 },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48];

const SocialWork: React.FC = () => {
	const { user, isAuthenticated } = useAuth();

	// UI State
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<SortValue>('publishedAt:desc');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);
	const [layout, setLayout] = useState<'grid' | 'list'>('grid');
	const [contentTypeFilter, setContentTypeFilter] = useState<string>('all'); // article/service filter
	const [typeTagFilter, setTypeTagFilter] = useState<string>('all'); // taxonomy type tag filter
	const [timeframe, setTimeframe] = useState<string>('all');
	const [selected, setSelected] = useState<Combined | null>(null);
	const [expandedTags, setExpandedTags] = useState(false);
	const [adminShowRaw, setAdminShowRaw] = useState(false);

	// Articles Query
	const { data: articlesData, isLoading: articlesLoading, error: articlesError, refetch: refetchArticles } = useQuery({
		queryKey: ['articles', DOMAIN_SLUG, { page, pageSize, search, sort }],
		queryFn: async () => {
			return cmsClient.getArticles({
				domain: DOMAIN_SLUG,
				status: 'published',
				limit: pageSize,
				offset: (page - 1) * pageSize,
				search: search || undefined,
			}) as Promise<any>;
		},
		staleTime: 5 * 60 * 1000,
	});

	// Services Query (not paged the same way; we'll fetch first N pages until threshold or just one page sized to pageSize)
	const { data: servicesData, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useQuery({
		queryKey: ['services', DOMAIN_SLUG, { page, pageSize }],
		queryFn: async () => {
			return fetchServicesList({ domain: DOMAIN_SLUG, page, pageSize });
		},
		staleTime: 5 * 60 * 1000,
	});

	const articles: ArticleNode[] = (articlesData?.articles?.data || []) as ArticleNode[];
	const services: ServiceItem[] = (servicesData?.items || []).map(s => ({
		id: s.id,
		slug: s.slug,
		title: s.title,
		summary: s.summary,
		domain: s.domain || DOMAIN_SLUG,
		typeTags: s.typeTags,
		heroImageUrl: s.heroImageUrl,
		publishedAt: s.publishedAt,
		readingMinutes: s.readingMinutes,
		authorName: s.authorName,
	}));

	const combined: Combined[] = useMemo(() => {
		const mappedArticles: Combined[] = articles.map(a => {
			const attr = a.attributes;
			const authorAttr = attr.author?.data?.attributes;
			const authorName = authorAttr ? `${authorAttr.firstname || ''} ${authorAttr.lastname || ''}`.trim() || authorAttr.email || 'Unknown' : 'Unknown';
			return {
				kind: 'article',
				id: a.id,
				title: attr.title,
				slug: attr.slug,
				summary: attr.summary || null,
				domain: attr.domain,
				tags: attr.tags || [],
				categories: attr.categories || [],
				publishedAt: attr.publishedAt || null,
				viewCount: attr.viewCount || 0,
				likeCount: attr.likeCount || 0,
				shareCount: attr.shareCount || 0,
				heroImage: attr.heroImage?.data?.attributes?.url || null,
				author: authorName,
				readingMinutes: null,
			};
		});

		const mappedServices: Combined[] = services.map(s => ({
			kind: 'service',
			id: s.id,
			title: s.title,
			slug: s.slug,
			summary: s.summary,
			domain: s.domain || DOMAIN_SLUG,
			tags: s.typeTags,
			categories: [],
			publishedAt: s.publishedAt,
			viewCount: 0,
			likeCount: 0,
			shareCount: 0,
			heroImage: s.heroImageUrl,
			author: s.authorName || 'Editorial',
			readingMinutes: s.readingMinutes,
		}));

		return [...mappedArticles, ...mappedServices];
	}, [articles, services]);

	// Timeframe filtering
	const timeframeFiltered = useMemo(() => {
		const tf = TIMEFRAMES.find(t => t.key === timeframe);
		if (!tf || tf.days === null) return combined;
		const cutoff = Date.now() - tf.days * 24 * 60 * 60 * 1000;
		return combined.filter(c => {
			if (!c.publishedAt) return false;
			return new Date(c.publishedAt).getTime() >= cutoff;
		});
	}, [combined, timeframe]);

	// Content type filter (article/service)
	const contentTypeFiltered = useMemo(() => {
		if (contentTypeFilter === 'all') return timeframeFiltered;
		return timeframeFiltered.filter(c => c.kind === contentTypeFilter);
	}, [timeframeFiltered, contentTypeFilter]);

	// Type tag filter (taxonomy type)
	const typeTagFiltered = useMemo(() => {
		if (typeTagFilter === 'all') return contentTypeFiltered;
		return contentTypeFiltered.filter(c => c.tags.includes(typeTagFilter));
	}, [contentTypeFiltered, typeTagFilter]);

	// Search filter
	const searchFiltered = useMemo(() => {
		if (!search) return typeTagFiltered;
		const q = search.toLowerCase();
		return typeTagFiltered.filter(c =>
			c.title.toLowerCase().includes(q) ||
			(c.summary || '').toLowerCase().includes(q) ||
			c.tags.some(t => t.toLowerCase().includes(q))
		);
	}, [typeTagFiltered, search]);

	// Client-side sort (fallback / ensures order after fusion)
	const [sortField, sortDir] = sort.split(':') as [string, string];
	const sorted = useMemo(() => {
		const copy = [...searchFiltered];
		copy.sort((a, b) => {
			const av = (a as any)[sortField] ?? '';
			const bv = (b as any)[sortField] ?? '';
			if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
			if (sortField === 'publishedAt') {
				const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
				const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
				return sortDir === 'asc' ? at - bt : bt - at;
			}
			return sortDir === 'asc'
				? String(av).localeCompare(String(bv))
				: String(bv).localeCompare(String(av));
		});
		return copy;
	}, [searchFiltered, sortField, sortDir]);

	// Combined pagination (client side after merge). We keep upstream queries sized similarly to reduce load.
	const totalItems = sorted.length;
	const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
	const paginated = useMemo(() => {
		const start = (page - 1) * pageSize;
		return sorted.slice(start, start + pageSize);
	}, [sorted, page, pageSize]);

	useEffect(() => {
		if (page > pageCount) setPage(1);
	}, [pageCount, page]);

	// Derived analytics
	const analytics = useMemo(() => {
		const base = {
			total: combined.length,
			articles: combined.filter(c => c.kind === 'article').length,
			services: combined.filter(c => c.kind === 'service').length,
			views: combined.reduce((acc, c) => acc + c.viewCount, 0),
			likes: combined.reduce((acc, c) => acc + c.likeCount, 0),
			shares: combined.reduce((acc, c) => acc + c.shareCount, 0),
			byTag: {} as Record<string, number>,
			byAuthor: {} as Record<string, number>,
			timeline: {} as Record<string, number>,
		};
		combined.forEach(c => {
			c.tags.forEach(t => { base.byTag[t] = (base.byTag[t] || 0) + 1; });
			base.byAuthor[c.author] = (base.byAuthor[c.author] || 0) + 1;
			if (c.publishedAt) {
				const day = new Date(c.publishedAt).toISOString().slice(0, 10);
				base.timeline[day] = (base.timeline[day] || 0) + 1;
			}
		});
		return base;
	}, [combined]);

	const topTags = useMemo(() => Object.entries(analytics.byTag).sort((a, b) => b[1] - a[1]), [analytics]);
	const topAuthors = useMemo(() => Object.entries(analytics.byAuthor).sort((a, b) => b[1] - a[1]), [analytics]);

	const handleRefresh = useCallback(() => {
		refetchArticles();
		refetchServices();
	}, [refetchArticles, refetchServices]);

	const loading = articlesLoading || servicesLoading;

	const errorMessage = (articlesError as any)?.message || (servicesError as any)?.message || null;

	const formatDate = (value: string | null) => {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<Helmet>
				<title>{`${DOMAIN_META.label} | HandyWriterz`}</title>
				<meta name="description" content={DOMAIN_META.description} />
				<link rel="canonical" href={`https://www.handywriterz.com/d/${DOMAIN_SLUG}`} />
			</Helmet>

			{/* Header */}
			<header className="bg-white border-b sticky top-0 z-30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
							<Layers className="w-6 h-6 text-emerald-600" />
						</div>
						<div>
							<h1 className="text-lg font-semibold leading-tight">{DOMAIN_META.label}</h1>
							<p className="text-xs text-muted-foreground">{DOMAIN_META.description}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="relative">
							<Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<Input
								value={search}
								onChange={(e) => { setSearch(e.target.value); setPage(1); }}
								placeholder="Search..."
								className="pl-9 w-64"
							/>
						</div>
						<div className="hidden md:flex items-center gap-2">
							<Button variant={layout === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('grid')}>
								<Grid className="w-4 h-4" />
							</Button>
							<Button variant={layout === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('list')}>
								<List className="w-4 h-4" />
							</Button>
						</div>
						<Button variant="outline" size="sm" onClick={handleRefresh} title="Refresh data">
							<RefreshCw className="w-4 h-4" />
						</Button>
						{isAuthenticated && user?.role === 'admin' && (
							<Button variant={adminShowRaw ? 'default' : 'outline'} size="sm" onClick={() => setAdminShowRaw(v => !v)}>
								<Database className="w-4 h-4 mr-1" /> Raw
							</Button>
						)}
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs defaultValue="content" className="space-y-8">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="filters">Filters</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="admin" disabled={!isAuthenticated || user?.role !== 'admin'}>Admin</TabsTrigger>
					</TabsList>

					{/* Content Tab */}
					<TabsContent value="content" className="space-y-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div className="flex items-center gap-4 flex-wrap">
								<h2 className="text-2xl font-bold">Items</h2>
								<Badge variant="secondary">{totalItems} total</Badge>
								<Badge variant="outline" className="hidden sm:inline-flex">{analytics.articles} articles</Badge>
								<Badge variant="outline" className="hidden sm:inline-flex">{analytics.services} services</Badge>
							</div>
							<div className="flex items-center gap-3 flex-wrap">
								<Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
									<SelectTrigger className="w-48"><SelectValue placeholder="Sort" /></SelectTrigger>
									<SelectContent>
										{SORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt.replace(':', ' ')}</SelectItem>)}
									</SelectContent>
								</Select>
								<Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v, 10)); setPage(1); }}>
									<SelectTrigger className="w-32"><SelectValue placeholder="Per page" /></SelectTrigger>
									<SelectContent>
										{PAGE_SIZE_OPTIONS.map(ps => <SelectItem key={ps} value={String(ps)}>{ps} / page</SelectItem>)}
									</SelectContent>
								</Select>
							</div>
						</div>

						{errorMessage && (
							<div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
								{errorMessage}
							</div>
						)}

						{loading ? (
							<div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
								{Array.from({ length: 6 }).map((_, i) => (
									<Card key={i} className="animate-pulse h-60 flex flex-col">
										<div className="h-32 bg-slate-200" />
										<CardContent className="p-4 space-y-3 flex-1">
											<div className="h-4 bg-slate-200 w-3/4 rounded" />
											<div className="h-3 bg-slate-200 w-full rounded" />
											<div className="h-3 bg-slate-200 w-1/2 rounded" />
										</CardContent>
									</Card>
								))}
							</div>
						) : paginated.length === 0 ? (
							<div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-600">No published content found for the current filters.</div>
						) : (
							<div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
								{paginated.map(item => (
									<Card key={item.id} className="group cursor-pointer flex flex-col" onClick={() => setSelected(item)}>
										<div className="h-40 bg-slate-100 overflow-hidden relative">
											{item.heroImage && (
												<img
													src={item.heroImage}
													alt={item.title}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform"
													loading="lazy"
												/>
											)}
											<div className="absolute top-2 left-2 flex gap-2">
												<Badge variant="outline" className="bg-white/80 backdrop-blur text-xs capitalize">{item.kind}</Badge>
												{item.tags.slice(0, 1).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
											</div>
										</div>
										<CardHeader className="space-y-2 pb-2">
											<CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600">{item.title}</CardTitle>
											{item.summary && <CardDescription className="line-clamp-2">{item.summary}</CardDescription>}
										</CardHeader>
										<CardFooter className="px-6 pb-4 pt-0 mt-auto flex items-center justify-between text-xs text-slate-500">
											<div className="flex items-center gap-3">
												<span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {item.viewCount}</span>
												<span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likeCount}</span>
												<span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.shareCount}</span>
											</div>
											<span>{item.publishedAt ? formatDate(item.publishedAt) : ''}</span>
										</CardFooter>
									</Card>
								))}
							</div>
						)}

						{/* Pagination */}
						{pageCount > 1 && (
							<div className="flex items-center justify-center gap-2 pt-4">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
								<span className="text-sm">Page {page} of {pageCount}</span>
								<Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>Next</Button>
							</div>
						)}
					</TabsContent>

					{/* Filters */}
						<TabsContent value="filters">
							<div className="grid md:grid-cols-3 gap-6">
								<Card className="md:col-span-1">
									<CardHeader>
										<CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</CardTitle>
										<CardDescription>Refine by source, type, or timeframe</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div>
											<div className="text-sm font-medium mb-2">Content Source</div>
											<div className="flex flex-wrap gap-2">
												{['all', 'article', 'service'].map(src => (
													<Button
														key={src}
														variant={contentTypeFilter === src ? 'default' : 'outline'}
														size="sm"
														onClick={() => { setContentTypeFilter(src); setPage(1); }}
													>
														{src.charAt(0).toUpperCase() + src.slice(1)}
													</Button>
												))}
											</div>
										</div>
										<Separator />
										<div>
											<div className="text-sm font-medium mb-2">Type Tag</div>
											<div className="flex flex-wrap gap-2">
												<Button
													variant={typeTagFilter === 'all' ? 'default' : 'outline'}
													size="sm"
													onClick={() => { setTypeTagFilter('all'); setPage(1); }}
												>All</Button>
												{TYPE_TAGS.map(t => (
													<Button
														key={t.slug}
														variant={typeTagFilter === t.slug ? 'default' : 'outline'}
														size="sm"
														onClick={() => { setTypeTagFilter(t.slug); setPage(1); }}
													>{t.label}</Button>
												))}
											</div>
										</div>
										<Separator />
										<div>
											<div className="text-sm font-medium mb-2">Timeframe</div>
											<div className="flex flex-wrap gap-2">
												{TIMEFRAMES.map(tf => (
													<Button
														key={tf.key}
														variant={timeframe === tf.key ? 'default' : 'outline'}
														size="sm"
														onClick={() => { setTimeframe(tf.key); setPage(1); }}
													>{tf.label}</Button>
												))}
											</div>
										</div>
									</CardContent>
								</Card>
								<Card className="md:col-span-2">
									<CardHeader>
										<CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5" /> Top Tags</CardTitle>
										<CardDescription>Derived from current dataset</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex flex-wrap gap-2">
											{(expandedTags ? topTags : topTags.slice(0, 24)).map(([tag, count]) => (
												<Badge
													key={tag}
													variant="secondary"
													className="cursor-pointer"
													onClick={() => { setTypeTagFilter(tag); setPage(1); }}
												>{tag} <span className="ml-1 text-xs opacity-70">{count}</span></Badge>
											))}
										</div>
										{topTags.length > 24 && (
											<Button variant="outline" size="sm" onClick={() => setExpandedTags(v => !v)} className="inline-flex items-center gap-2">
												{expandedTags ? <>Show Less <ChevronUp className="w-4 h-4" /></> : <>Show More <ChevronDown className="w-4 h-4" /></>}
											</Button>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>

					{/* Analytics */}
					<TabsContent value="analytics" className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Total Items</CardTitle>
									<BarChart3 className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.total}</div>
									<p className="text-xs text-muted-foreground">{analytics.articles} articles • {analytics.services} services</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Views</CardTitle>
									<Eye className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
									<Progress value={Math.min(100, (analytics.views / Math.max(1, analytics.total * 1000)) * 100)} className="mt-2" />
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Likes</CardTitle>
									<Heart className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.likes.toLocaleString()}</div>
									<Progress value={Math.min(100, (analytics.likes / Math.max(1, analytics.total * 200)) * 100)} className="mt-2" />
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Shares</CardTitle>
									<MessageCircle className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.shares.toLocaleString()}</div>
									<Progress value={Math.min(100, (analytics.shares / Math.max(1, analytics.total * 100)) * 100)} className="mt-2" />
								</CardContent>
							</Card>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Top Authors</CardTitle>
									<CardDescription>Publishing volume by author</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Author</TableHead>
												<TableHead className="w-24 text-right">Items</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{topAuthors.slice(0, 20).map(([name, count]) => (
												<TableRow key={name}>
													<TableCell className="truncate max-w-[14rem]" title={name}>{name}</TableCell>
													<TableCell className="text-right">{count}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Tag Distribution</CardTitle>
									<CardDescription>Most used tags</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									{topTags.slice(0, 30).map(([tag, count]) => {
										const pct = Math.round((count / Math.max(1, analytics.total)) * 100);
										return (
											<div key={tag} className="flex items-center gap-3">
												<div className="w-48 truncate" title={tag}>{tag}</div>
												<div className="flex-1">
													<Progress value={pct} />
												</div>
												<span className="w-12 text-right text-xs">{count}</span>
											</div>
										);
									})}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Admin */}
					<TabsContent value="admin" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Domain Insights</CardTitle>
								<CardDescription>Operational overview derived from live data</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="rounded-lg border bg-white p-4">
										<div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Publishing Pace</div>
										<div className="text-2xl font-bold">{Object.keys(analytics.timeline).length}</div>
										<p className="text-xs text-slate-500 mt-1">Distinct publish days</p>
									</div>
									<div className="rounded-lg border bg-white p-4">
										<div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Median Items / Day</div>
										<div className="text-2xl font-bold">{(() => {
											const counts = Object.values(analytics.timeline).sort((a, b) => a - b);
											if (counts.length === 0) return 0;
											const mid = Math.floor(counts.length / 2);
											return counts.length % 2 === 0 ? Math.round((counts[mid - 1] + counts[mid]) / 2) : counts[mid];
										})()}</div>
										<p className="text-xs text-slate-500 mt-1">Active publishing cadence</p>
									</div>
									<div className="rounded-lg border bg-white p-4">
										<div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Authors</div>
										<div className="text-2xl font-bold">{topAuthors.length}</div>
										<p className="text-xs text-slate-500 mt-1">Unique contributors</p>
									</div>
								</div>

								{adminShowRaw && (
									<div className="rounded-lg border bg-white p-4">
										<pre className="overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap max-h-[40vh]">{JSON.stringify({ articles: articles.length, services: services.length, analytics }, null, 2)}</pre>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>

			{/* Detail Dialog */}
			<Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					{selected && (
						<>
							<DialogHeader>
								<DialogTitle>{selected.title}</DialogTitle>
								{selected.summary && <DialogDescription>{selected.summary}</DialogDescription>}
							</DialogHeader>
							<div className="space-y-4">
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline">{selected.kind}</Badge>
									{selected.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
								</div>
								<div className="flex items-center gap-4 text-sm text-slate-600">
									<span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {selected.viewCount}</span>
									<span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" /> {selected.likeCount}</span>
									<span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {selected.shareCount}</span>
									{selected.publishedAt && <span><Calendar className="w-4 h-4 inline mr-1" /> {formatDate(selected.publishedAt)}</span>}
								</div>
								<div className="text-sm text-slate-700 leading-relaxed">
									{selected.summary}
								</div>
								<a
									href={selected.kind === 'service' ? `/services/${DOMAIN_SLUG}/${selected.slug}` : `/services?domain=${DOMAIN_SLUG}&article=${selected.slug}`}
									className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
								>
									Open full {selected.kind}
									<ArrowRight className="w-4 h-4" />
								</a>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SocialWork;
