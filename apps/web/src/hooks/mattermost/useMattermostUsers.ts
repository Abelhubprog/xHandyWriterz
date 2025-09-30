import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mattermostClient } from '@/lib/mm-client';

export function useMattermostUsers(userIds: string[], enabled: boolean) {
  const deduped = useMemo(() => Array.from(new Set(userIds)).sort(), [userIds]);

  const query = useQuery({
    queryKey: ['mattermost', 'users', deduped.join(',')],
    queryFn: () => mattermostClient.getUsersByIds(deduped),
    enabled: enabled && deduped.length > 0,
    staleTime: 120_000,
  });

  return useMemo(() => ({
    users: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }), [query.data, query.error, query.isLoading]);
}

export default useMattermostUsers;
