import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { mattermostClient, type MattermostChannel } from '@/lib/mm-client';

interface UseChannelsOptions {
  enabled: boolean;
}

export function useMattermostChannels(options: UseChannelsOptions) {
  const query = useQuery<MattermostChannel[]>({
    queryKey: ['mattermost', 'channels'],
    queryFn: () => mattermostClient.listChannels(),
    enabled: options.enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const refresh = useCallback(() => query.refetch(), [query]);

  return useMemo(() => ({
    channels: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refresh,
  }), [query.data, query.error, query.isFetching, query.isLoading, refresh]);
}

export default useMattermostChannels;
