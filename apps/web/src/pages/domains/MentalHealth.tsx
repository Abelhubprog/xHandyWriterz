import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
	Search,
	Filter,
	Grid,
	List,
	Heart,
	Eye,
	MessageCircle,
	TrendingUp,
	Users,
	BarChart3,
	Plus,
	Settings,
	ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { CMSClient } from '@/lib/cms-client';
import { useAuth } from '@/hooks/useAuth';

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

type ArticlesQueryResult = {
	articles?: {
		data?: ArticleNode[];
		meta?: { pagination?: { total?: number; page?: number; pageSize?: number; pageCount?: number } };
	};
};

type Layout = 'grid' | 'list';

const MentalHealth: React.FC = () => {
	const { user, isAuthenticated } = useAuth();

	// UI state
	const [search, setSearch] = useState('');
	const [layout, setLayout] = useState<Layout>('grid');
	const [sort, setSort] = useState('publishedAt:desc');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [difficulty, setDifficulty] = useState<string>('');
	const [selected, setSelected] = useState<ArticleNode | null>(null);

	// Fetch articles for mental health domain
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['articles', 'mental-health', { page, pageSize, search, sort }],
		queryFn: async (): Promise<ArticlesQueryResult> => {
			const res: any = await cmsClient.getArticles({
				domain: 'mental-health',
				status: 'published',
				limit: pageSize,
				offset: (page - 1) * pageSize,
				search: search || undefined,
			});
			return res as ArticlesQueryResult;
		},
		staleTime: 5 * 60 * 1000,
	});

	const items = useMemo(() => {
		const list = (data?.articles?.data || []) as ArticleNode[];
		// Client-side filtering by tags/difficulty if present
		const filtered = list.filter((n) => {
			const tags = n.attributes.tags || [];
			const passTags = selectedTags.length === 0 || selectedTags.some((t) => tags.includes(t));
			// difficulty is modeled as a tag for now
			const passDifficulty = !difficulty || tags.includes(difficulty);
			return passTags && passDifficulty;
		});
		// Client-side sort as a fallback
		const [field, dir] = (sort || 'publishedAt:desc').split(':');
		const sorted = [...filtered].sort((a, b) => {
			const av = (a.attributes as any)[field] ?? '';
			const bv = (b.attributes as any)[field] ?? '';
			if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av;
			return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
		});
		return sorted;
	}, [data, selectedTags, difficulty, sort]);

	const pagination = data?.articles?.meta?.pagination || { total: items.length, page, pageSize, pageCount: 1 };

	const analytics = useMemo(() => {
		const counts = items.reduce(
			(acc, n) => {
				acc.views += n.attributes.viewCount || 0;
				acc.likes += n.attributes.likeCount || 0;
				acc.shares += n.attributes.shareCount || 0;
				return acc;
			},
			{ views: 0, likes: 0, shares: 0 }
		);
		return {
			total: items.length,
			...counts,
			byTag: items.reduce<Record<string, number>>((acc, n) => {
				(n.attributes.tags || []).forEach((t) => { acc[t] = (acc[t] || 0) + 1; });
				return acc;
			}, {}),
		};
	}, [items]);

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
		setPage(1);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Helmet>
				<title>Mental Health Nursing - HandyWriterz</title>
				<meta name="description" content="Therapeutic techniques, behavioral health insights, and comprehensive resources for mental health nursing." />
				<link rel="canonical" href="https://handywriterz.com/d/mental-health" />
			</Helmet>

			{/* Header */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
							<TrendingUp className="w-6 h-6 text-purple-600" />
						</div>
						<div>
							<h1 className="text-xl font-semibold">Mental Health Nursing</h1>
							<p className="text-xs text-muted-foreground">Evidence-based behavioral health resources</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="relative">
							<Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<Input
								value={search}
								onChange={(e) => { setSearch(e.target.value); setPage(1); }}
								placeholder="Search articles..."
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

						{isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
							<Button variant="outline" size="sm">
								<Plus className="w-4 h-4 mr-2" />
								New Article
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs defaultValue="content" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="filters">Filters</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="admin" disabled={!isAuthenticated || user?.role !== 'admin'}>Admin</TabsTrigger>
					</TabsList>

					{/* Content */}
					<TabsContent value="content" className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<h2 className="text-2xl font-bold">Articles</h2>
								<Badge variant="secondary">{analytics.total} items</Badge>
							</div>

							<div className="flex items-center gap-3">
								<Select value={sort} onValueChange={(v) => setSort(v)}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="publishedAt:desc">Newest</SelectItem>
										<SelectItem value="publishedAt:asc">Oldest</SelectItem>
										<SelectItem value="viewCount:desc">Most Viewed</SelectItem>
										<SelectItem value="likeCount:desc">Most Liked</SelectItem>
										<SelectItem value="title:asc">Title A-Z</SelectItem>
										<SelectItem value="title:desc">Title Z-A</SelectItem>
									</SelectContent>
								</Select>

								<Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v, 10)); setPage(1); }}>
									<SelectTrigger className="w-36">
										<SelectValue placeholder="Per page" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="12">12 / page</SelectItem>
										<SelectItem value="24">24 / page</SelectItem>
										<SelectItem value="48">48 / page</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{isLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{Array.from({ length: 6 }).map((_, i) => (
									<Card key={i} className="h-64 animate-pulse">
										<div className="h-32 bg-gray-200 rounded-t-xl" />
										<CardContent className="space-y-3 p-6">
											<div className="h-4 bg-gray-200 rounded w-3/4" />
											<div className="h-3 bg-gray-200 rounded w-full" />
											<div className="h-3 bg-gray-200 rounded w-1/2" />
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
								{items.map((node) => {
									const a = node.attributes;
									const hero = a.heroImage?.data?.attributes?.url || '';
									const author = a.author?.data?.attributes;
									const authorName = author ? `${author.firstname || ''} ${author.lastname || ''}`.trim() : 'Unknown';

									if (layout === 'list') {
										return (
											<Card key={node.id} className="group cursor-pointer" onClick={() => setSelected(node)}>
												<CardContent className="p-6 flex gap-4">
													<div className="w-32 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
														{hero ? <img src={hero} alt={a.title} className="w-full h-full object-cover" /> : null}
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2 mb-2">
															<Badge variant="outline">{a.domain}</Badge>
															{(a.tags || []).slice(0, 3).map((t) => (
																<Badge key={t} variant="secondary">{t}</Badge>
															))}
														</div>
														<CardTitle className="text-lg group-hover:text-purple-600 line-clamp-2">{a.title}</CardTitle>
														{a.summary ? (
															<CardDescription className="mt-1 line-clamp-2">{a.summary}</CardDescription>
														) : null}
														<div className="mt-3 text-sm text-muted-foreground flex items-center gap-4">
															<span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {a.viewCount ?? 0}</span>
															<span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" /> {a.likeCount ?? 0}</span>
															<span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {a.shareCount ?? 0}</span>
														</div>
													</div>
												</CardContent>
											</Card>
										);
									}

									return (
										<Card key={node.id} className="group cursor-pointer" onClick={() => setSelected(node)}>
											<div className="h-40 bg-gray-100 rounded-t-xl overflow-hidden">
												{hero ? <img src={hero} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : null}
											</div>
											<CardHeader className="pb-2">
												<div className="flex items-center justify-between">
													<Badge variant="outline">{a.domain}</Badge>
													<span className="text-xs text-muted-foreground">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}</span>
												</div>
												<CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600">{a.title}</CardTitle>
												{a.summary ? <CardDescription className="line-clamp-2">{a.summary}</CardDescription> : null}
											</CardHeader>
											<CardFooter className="pt-0 px-6 pb-4 flex items-center justify-between">
												<div className="flex items-center gap-3 text-sm text-muted-foreground">
													<span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {a.viewCount ?? 0}</span>
													<span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" /> {a.likeCount ?? 0}</span>
													<span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {a.shareCount ?? 0}</span>
												</div>
												<div className="flex items-center gap-2">
													<Avatar className="w-6 h-6">
														<AvatarImage src={undefined} />
														<AvatarFallback>{(authorName || 'U')[0]}</AvatarFallback>
													</Avatar>
													<span className="text-sm truncate max-w-[10rem]" title={authorName}>{authorName}</span>
												</div>
											</CardFooter>
										</Card>
									);
								})}
							</div>
						)}

						{/* Pagination */}
						{((pagination?.pageCount || 1) > 1) && (
							<div className="flex items-center justify-center gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
									Previous
								</Button>
								<span className="text-sm">Page {page} of {pagination?.pageCount || 1}</span>
								<Button variant="outline" size="sm" disabled={page >= (pagination?.pageCount || 1)} onClick={() => setPage((p) => p + 1)}>
									Next
								</Button>
							</div>
						)}
					</TabsContent>

					{/* Filters */}
					<TabsContent value="filters">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</CardTitle>
								<CardDescription>Refine content by tags and difficulty</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<div className="text-sm font-medium mb-2">Popular Tags</div>
									<div className="flex flex-wrap gap-2">
										{Object.entries(analytics.byTag).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag, count]) => (
											<Badge key={tag} variant={selectedTags.includes(tag) ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleTag(tag)}>
												{tag} <span className="ml-1 text-xs opacity-80">{count}</span>
											</Badge>
										))}
									</div>
								</div>

								<Separator />

								<div>
									<div className="text-sm font-medium mb-2">Difficulty</div>
									<RadioGroup value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
										<div className="flex items-center gap-2"><RadioGroupItem id="diff-beginner" value="beginner" /><label htmlFor="diff-beginner" className="text-sm">Beginner</label></div>
										<div className="flex items-center gap-2"><RadioGroupItem id="diff-intermediate" value="intermediate" /><label htmlFor="diff-intermediate" className="text-sm">Intermediate</label></div>
										<div className="flex items-center gap-2"><RadioGroupItem id="diff-advanced" value="advanced" /><label htmlFor="diff-advanced" className="text-sm">Advanced</label></div>
									</RadioGroup>
								</div>

								<Separator />

								<div className="flex items-center gap-3">
									<Button variant="outline" onClick={() => { setSelectedTags([]); setDifficulty(''); setPage(1); }}>Clear Filters</Button>
									<Button onClick={() => refetch()}>Apply</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Analytics */}
					<TabsContent value="analytics">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Total Articles</CardTitle>
									<BarChart3 className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.total}</div>
									<p className="text-xs text-muted-foreground">Domain: mental-health</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Total Views</CardTitle>
									<Eye className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
									<Progress value={Math.min(100, (analytics.views / Math.max(1, analytics.total * 1000)) * 100)} className="mt-2" />
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Total Likes</CardTitle>
									<Heart className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.likes.toLocaleString()}</div>
									<Progress value={Math.min(100, (analytics.likes / Math.max(1, analytics.total * 200)) * 100)} className="mt-2" />
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2 flex items-center justify-between">
									<CardTitle className="text-sm font-medium">Total Shares</CardTitle>
									<MessageCircle className="w-4 h-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{analytics.shares.toLocaleString()}</div>
									<Progress value={Math.min(100, (analytics.shares / Math.max(1, analytics.total * 100)) * 100)} className="mt-2" />
								</CardContent>
							</Card>
						</div>

						<Card className="mt-6">
							<CardHeader>
								<CardTitle>Top Tags</CardTitle>
								<CardDescription>Distribution of content by tag</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Tag</TableHead>
											<TableHead className="w-40">Share</TableHead>
											<TableHead className="w-24 text-right">Items</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Object.entries(analytics.byTag).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([tag, count]) => {
											const percent = Math.round((count / Math.max(1, analytics.total)) * 100);
											return (
												<TableRow key={tag}>
													<TableCell>
														<div className="inline-flex items-center gap-2">
															<Badge variant="secondary">{tag}</Badge>
														</div>
													</TableCell>
													<TableCell>
														<Progress value={percent} />
													</TableCell>
													<TableCell className="text-right">{count}</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Admin */}
					<TabsContent value="admin">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Domain Configuration</CardTitle>
								<CardDescription>Admin-only settings for mental health content</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<div className="font-medium">Require review before publishing</div>
										<div className="text-sm text-muted-foreground">Enforce peer review workflow</div>
									</div>
									<Checkbox checked readOnly aria-readonly />
								</div>

								<Separator />

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">Contributor Activity</CardTitle>
											<CardDescription>Recently active authors</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Placeholder table powered by current items */}
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Author</TableHead>
														<TableHead className="w-24 text-right">Articles</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{Object.entries(
														items.reduce<Record<string, number>>((acc, n) => {
															const auth = n.attributes.author?.data?.attributes;
															const name = auth ? `${auth.firstname || ''} ${auth.lastname || ''}`.trim() : 'Unknown';
															acc[name] = (acc[name] || 0) + 1;
															return acc;
														}, {})
													).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => (
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
											<CardTitle className="text-base">Community</CardTitle>
											<CardDescription>Engagement highlights</CardDescription>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Users className="w-4 h-4" /> Active readers (est.)</span><span className="font-medium">{Math.max(analytics.total * 12, 100)}</span></div>
											<div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Heart className="w-4 h-4" /> Likes</span><span className="font-medium">{analytics.likes}</span></div>
											<div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Views</span><span className="font-medium">{analytics.views}</span></div>
										</CardContent>
									</Card>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			{/* Detail Dialog */}
			<Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					{selected && (
						<>
							<DialogHeader>
								<DialogTitle>{selected.attributes.title}</DialogTitle>
								{selected.attributes.summary ? <DialogDescription>{selected.attributes.summary}</DialogDescription> : null}
							</DialogHeader>
							<div className="space-y-4">
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {selected.attributes.viewCount ?? 0}</span>
									<span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" /> {selected.attributes.likeCount ?? 0}</span>
									<span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {selected.attributes.shareCount ?? 0}</span>
								</div>
								<Separator />
								<div className="prose max-w-none">
									{/* Content is block-based JSON in Strapi; render summary for now. Future: Rich block renderer. */}
									{selected.attributes.summary || 'This article uses block-based content. Rendering of rich blocks will be implemented in the shared renderer.'}
								</div>
								<a
									className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
									href={`/services?domain=mental-health&article=${selected.attributes.slug}`}
								>
									Open full article
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

export default MentalHealth;
