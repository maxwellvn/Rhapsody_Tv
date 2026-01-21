import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';

/**
 * Query Keys for Channels
 */
export const channelKeys = {
  all: ['channels'] as const,
  lists: () => [...channelKeys.all, 'list'] as const,
  detail: (id: string) => [...channelKeys.all, 'detail', id] as const,
  videos: (id: string) => [...channelKeys.all, 'videos', id] as const,
  videoList: (id: string, page: number, limit: number) => [...channelKeys.videos(id), page, limit] as const,
  subscriptions: () => [...channelKeys.all, 'subscriptions'] as const,
  subscriptionStatus: (id: string) => [...channelKeys.all, 'subscription-status', id] as const,
};

/**
 * Get channel details
 */
export function useChannel(channelId: string | undefined) {
  return useQuery({
    queryKey: channelKeys.detail(channelId || ''),
    queryFn: async () => {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      const response = await channelService.getChannelDetails(channelId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch channel');
      }
      return response.data;
    },
    enabled: !!channelId,
    retry: 1, // Only retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}

/**
 * Get channel videos (paginated)
 */
export function useChannelVideos(channelId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: channelKeys.videoList(channelId, page, limit),
    queryFn: async () => {
      const response = await channelService.getChannelVideos(channelId, page, limit);
      return response.data;
    },
    enabled: !!channelId,
  });
}

/**
 * Get channel videos with infinite scroll
 */
export function useInfiniteChannelVideos(channelId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: channelKeys.videos(channelId),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await channelService.getChannelVideos(channelId, pageParam, limit);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!channelId,
  });
}

/**
 * Get user subscriptions
 */
export function useSubscriptions() {
  return useQuery({
    queryKey: channelKeys.subscriptions(),
    queryFn: async () => {
      const response = await channelService.getSubscriptions();
      return response.data;
    },
  });
}

/**
 * Get subscription status for a channel
 */
export function useSubscriptionStatus(channelId: string | undefined) {
  return useQuery({
    queryKey: channelKeys.subscriptionStatus(channelId || ''),
    queryFn: async () => {
      if (!channelId) return { isSubscribed: false };
      const response = await channelService.getSubscriptionStatus(channelId);
      return response.data;
    },
    enabled: !!channelId,
  });
}

/**
 * Subscribe to channel
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      await channelService.subscribe(channelId);
      return channelId;
    },
    onSuccess: (channelId) => {
      // Update subscription status cache
      queryClient.setQueryData(channelKeys.subscriptionStatus(channelId), {
        isSubscribed: true,
      });

      // Update channel detail cache
      queryClient.setQueryData(channelKeys.detail(channelId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          subscriberCount: (old.subscriberCount || 0) + 1,
        };
      });
      
      // Invalidate subscriptions list
      queryClient.invalidateQueries({ 
        queryKey: channelKeys.subscriptions() 
      });
    },
  });
}

/**
 * Unsubscribe from channel
 */
export function useUnsubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      await channelService.unsubscribe(channelId);
      return channelId;
    },
    onSuccess: (channelId) => {
      // Update subscription status cache
      queryClient.setQueryData(channelKeys.subscriptionStatus(channelId), {
        isSubscribed: false,
      });

      queryClient.setQueryData(channelKeys.detail(channelId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          subscriberCount: Math.max(0, (old.subscriberCount || 0) - 1),
        };
      });
      
      queryClient.invalidateQueries({ 
        queryKey: channelKeys.subscriptions() 
      });
    },
  });
}
