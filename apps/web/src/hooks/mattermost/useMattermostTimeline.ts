import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  mattermostClient,
  type MattermostPost,
  type MattermostFileInfo,
  type MattermostChannel,
} from '@/lib/mm-client';
import { getMattermostRealtimeClient } from '@/lib/mm-ws';
import { useMattermostUsers } from './useMattermostUsers';

const postsKey = (channelId: string) => ['mattermost', 'channels', channelId, 'posts'] as const;

type PostsState = Awaited<ReturnType<typeof mattermostClient.getPosts>>;

export function useMattermostTimeline(channelId: string | null, enabled = true) {
  const queryClient = useQueryClient();
  const [typingMap, setTypingMap] = useState<Record<string, number>>({});
  const channelIdRef = useRef<string | null>(channelId);

  useEffect(() => {
    channelIdRef.current = channelId;
    setTypingMap({});
  }, [channelId]);

  const query = useQuery({
    queryKey: channelId ? postsKey(channelId) : ['mattermost', 'channels', 'none', 'posts'],
    queryFn: () => {
      if (!channelId) throw new Error('Channel not selected');
      return mattermostClient.getPosts(channelId);
    },
    enabled: Boolean(channelId) && enabled,
    staleTime: 10_000,
    refetchInterval: 45_000,
  });

  const posts = useMemo<MattermostPost[]>(() => {
    if (!query.data) return [];
    return query.data.order
      .map((id) => query.data?.posts[id])
      .filter((post): post is MattermostPost => Boolean(post))
      .sort((a, b) => a.create_at - b.create_at);
  }, [query.data]);

  const userIds = useMemo(() => posts.map((post) => post.user_id), [posts]);
  const { users } = useMattermostUsers(userIds, Boolean(channelId) && enabled);

  const bumpChannel = useCallback(
    (id: string, timestamp: number) => {
      queryClient.setQueryData<MattermostChannel[] | undefined>(['mattermost', 'channels'], (channels) => {
        if (!channels) return channels;
        const updated = channels.map((channel) =>
          channel.id === id ? { ...channel, last_post_at: timestamp } : channel,
        );
        return [...updated].sort((a, b) => (b.last_post_at ?? 0) - (a.last_post_at ?? 0));
      });
    },
    [queryClient],
  );

  const mergePost = useCallback(
    (post: MattermostPost) => {
      if (!channelId) return;
      queryClient.setQueryData<PostsState | undefined>(postsKey(channelId), (current) => {
        const next: PostsState = current
          ? { order: [...current.order], posts: { ...current.posts } }
          : { order: [], posts: {} };
        next.posts[post.id] = post;
        const existingIndex = next.order.indexOf(post.id);
        if (existingIndex >= 0) {
          next.order.splice(existingIndex, 1);
        }
        next.order.unshift(post.id);
        return next;
      });
      bumpChannel(post.channel_id, post.create_at);
    },
    [bumpChannel, channelId, queryClient],
  );

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, fileIds, rootId }: { message: string; fileIds?: string[]; rootId?: string }) => {
      if (!channelId) throw new Error('Channel not selected');
      return mattermostClient.createPost({ channelId, message, fileIds, rootId });
    },
    onSuccess: (post) => {
      mergePost(post);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!channelId) throw new Error('Channel not selected');
      return mattermostClient.uploadFiles(channelId, files);
    },
  });

  const markRead = useCallback(async () => {
    if (!channelId) return;
    try {
      await mattermostClient.markChannelViewed(channelId);
    } catch (error) {
      console.warn('Unable to mark channel as read', error);
    }
  }, [channelId]);

  useEffect(() => {
    if (!channelId || !enabled) {
      return;
    }
    const socket = getMattermostRealtimeClient();
    const release = socket.retain();
    socket.connect();
    const unsubscribe = socket.subscribe((event) => {
      if (event.type === 'posted' && event.post.channel_id === channelId) {
        mergePost(event.post);
      }
      if (event.type === 'typing' && event.channelId === channelId) {
        const userId = event.userId;
        setTypingMap((prev) => ({ ...prev, [userId]: Date.now() + 6000 }));
      }
    });
    return () => {
      unsubscribe();
      release();
    };
  }, [channelId, enabled, mergePost]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const interval = window.setInterval(() => {
      setTypingMap((prev) => {
        const now = Date.now();
        const nextEntries = Object.entries(prev).filter(([, expires]) => expires > now);
        if (nextEntries.length === Object.keys(prev).length) {
          return prev;
        }
        return Object.fromEntries(nextEntries);
      });
    }, 2000);
    return () => window.clearInterval(interval);
  }, [enabled]);

  const sendMessage = useCallback(
    async (message: string, options?: { fileIds?: string[]; rootId?: string }) => {
      await sendMessageMutation.mutateAsync({ message, fileIds: options?.fileIds, rootId: options?.rootId });
    },
    [sendMessageMutation],
  );

  const uploadFiles = useCallback(
    async (files: File[]): Promise<MattermostFileInfo[]> => {
      return uploadMutation.mutateAsync(files);
    },
    [uploadMutation],
  );

  const sendTyping = useCallback(() => {
    if (!channelIdRef.current) return;
    const socket = getMattermostRealtimeClient();
    const release = socket.retain();
    socket.connect();
    socket.sendTyping(channelIdRef.current);
    release();
  }, []);

  useEffect(() => {
    if (!posts.length) return;
    void markRead();
  }, [markRead, posts.length]);

  return {
    posts,
    userMap: users,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
    sendMessage,
    uploadFiles,
    isSending: sendMessageMutation.isPending,
    isUploading: uploadMutation.isPending,
    markRead,
    dataUpdatedAt: query.dataUpdatedAt,
    sendTyping,
    typingUserIds: Object.keys(typingMap),
  } as const;
}

export default useMattermostTimeline;
