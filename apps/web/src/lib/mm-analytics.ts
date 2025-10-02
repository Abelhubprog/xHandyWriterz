/**
 * Mattermost Analytics Module
 * Provides aggregated metrics for admin dashboards
 */

import { mattermostClient, type MattermostChannel, type MattermostPost } from '@/lib/mm-client';

export interface ChannelAnalytics {
  channelId: string;
  channelName: string;
  messageCount: number;
  lastActivity: number;
  userCount: number;
}

export interface MessageVolumeMetrics {
  totalMessages: number;
  messagesLast24h: number;
  messagesLast7d: number;
  messagesLast30d: number;
}

export interface ResponseTimeMetrics {
  averageResponseTimeMs: number;
  medianResponseTimeMs: number;
  percentile95Ms: number;
}

export interface MattermostAnalyticsSummary {
  messageVolume: MessageVolumeMetrics;
  responseTime: ResponseTimeMetrics;
  topChannels: ChannelAnalytics[];
  totalChannels: number;
  activeUsers: Set<string>;
}

/**
 * Fetch analytics summary for all accessible channels
 */
export async function fetchMattermostAnalytics(teamId?: string): Promise<MattermostAnalyticsSummary> {
  const channels = await mattermostClient.listChannels(teamId);
  
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  let totalMessages = 0;
  let messagesLast24h = 0;
  let messagesLast7d = 0;
  let messagesLast30d = 0;
  
  const responseTimesMs: number[] = [];
  const activeUsers = new Set<string>();
  const channelMetrics: ChannelAnalytics[] = [];

  // Fetch posts for each channel and compute metrics
  for (const channel of channels) {
    try {
      const { posts, order } = await mattermostClient.getPosts(channel.id, 0, 100);
      
      const sortedPosts = order.map((id) => posts[id]).filter(Boolean);
      const messageCount = sortedPosts.length;
      totalMessages += messageCount;

      sortedPosts.forEach((post) => {
        const age = now - post.create_at;
        if (age <= day) messagesLast24h++;
        if (age <= 7 * day) messagesLast7d++;
        if (age <= 30 * day) messagesLast30d++;
        activeUsers.add(post.user_id);
      });

      // Calculate response times for threads (replies to root posts)
      const threadPairs = sortedPosts.reduce<Array<{ root: MattermostPost; reply: MattermostPost }>>((acc, post) => {
        if (post.message) {
          const parentId = post.props?.root_id;
          if (parentId && posts[parentId]) {
            acc.push({ root: posts[parentId], reply: post });
          }
        }
        return acc;
      }, []);

      threadPairs.forEach(({ root, reply }) => {
        const responseTime = reply.create_at - root.create_at;
        if (responseTime > 0 && responseTime < 7 * day) {
          responseTimesMs.push(responseTime);
        }
      });

      channelMetrics.push({
        channelId: channel.id,
        channelName: channel.display_name || channel.name,
        messageCount,
        lastActivity: channel.last_post_at ?? 0,
        userCount: new Set(sortedPosts.map((p) => p.user_id)).size,
      });
    } catch (error) {
      console.warn(`Failed to fetch analytics for channel ${channel.id}`, error);
    }
  }

  // Compute response time metrics
  responseTimesMs.sort((a, b) => a - b);
  const averageResponseTimeMs = responseTimesMs.length
    ? responseTimesMs.reduce((sum, val) => sum + val, 0) / responseTimesMs.length
    : 0;
  const medianResponseTimeMs = responseTimesMs.length
    ? responseTimesMs[Math.floor(responseTimesMs.length / 2)]
    : 0;
  const percentile95Ms = responseTimesMs.length
    ? responseTimesMs[Math.floor(responseTimesMs.length * 0.95)]
    : 0;

  // Sort channels by activity
  const topChannels = channelMetrics.sort((a, b) => b.lastActivity - a.lastActivity).slice(0, 10);

  return {
    messageVolume: {
      totalMessages,
      messagesLast24h,
      messagesLast7d,
      messagesLast30d,
    },
    responseTime: {
      averageResponseTimeMs,
      medianResponseTimeMs,
      percentile95Ms,
    },
    topChannels,
    totalChannels: channels.length,
    activeUsers,
  };
}

/**
 * Format response time in human-readable format
 */
export function formatResponseTime(ms: number): string {
  const minutes = Math.floor(ms / (60 * 1000));
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
