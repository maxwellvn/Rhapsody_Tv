import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programService } from '@/services/program.service';

// Query keys
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (limit?: number) => [...programKeys.lists(), { limit }] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  videos: (id: string, page?: number) => [...programKeys.all, 'videos', id, { page }] as const,
  subscriptions: () => [...programKeys.all, 'subscriptions'] as const,
  subscriptionStatus: (id: string) => [...programKeys.all, 'subscription-status', id] as const,
};

/**
 * Hook to fetch all programs
 */
export function usePrograms(limit?: number) {
  return useQuery({
    queryKey: programKeys.list(limit),
    queryFn: async () => {
      const response = await programService.getPrograms(limit);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });
}

/**
 * Hook to fetch a single program by ID
 */
export function useProgramDetail(programId: string | undefined) {
  return useQuery({
    queryKey: programKeys.detail(programId || ''),
    queryFn: async () => {
      if (!programId) {
        throw new Error('Program ID is required');
      }
      const response = await programService.getProgramById(programId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Program not found');
      }
      return response.data;
    },
    enabled: !!programId,
  });
}

/**
 * Hook to fetch videos for a specific program
 */
export function useProgramVideos(programId: string | undefined, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: programKeys.videos(programId || '', page),
    queryFn: async () => {
      if (!programId) {
        throw new Error('Program ID is required');
      }
      const response = await programService.getProgramVideos(programId, page, limit);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!programId,
  });
}

/**
 * Get user program subscriptions
 */
export function useProgramSubscriptions() {
  return useQuery({
    queryKey: programKeys.subscriptions(),
    queryFn: async () => {
      const response = await programService.getSubscriptions();
      return response.data;
    },
  });
}

/**
 * Get subscription status for a program
 */
export function useProgramSubscriptionStatus(programId: string | undefined) {
  return useQuery({
    queryKey: programKeys.subscriptionStatus(programId || ''),
    queryFn: async () => {
      if (!programId) return { isSubscribed: false };
      const response = await programService.getSubscriptionStatus(programId);
      return response.data;
    },
    enabled: !!programId,
  });
}

/**
 * Subscribe to a program
 */
export function useProgramSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      await programService.subscribe(programId);
      return programId;
    },
    onSuccess: (programId) => {
      // Update subscription status cache
      queryClient.setQueryData(programKeys.subscriptionStatus(programId), {
        isSubscribed: true,
      });

      // Update program detail cache
      queryClient.setQueryData(programKeys.detail(programId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          subscriberCount: (old.subscriberCount || 0) + 1,
        };
      });
      
      // Invalidate subscriptions list
      queryClient.invalidateQueries({ 
        queryKey: programKeys.subscriptions() 
      });
    },
  });
}

/**
 * Unsubscribe from a program
 */
export function useProgramUnsubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      await programService.unsubscribe(programId);
      return programId;
    },
    onSuccess: (programId) => {
      // Update subscription status cache
      queryClient.setQueryData(programKeys.subscriptionStatus(programId), {
        isSubscribed: false,
      });

      queryClient.setQueryData(programKeys.detail(programId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          subscriberCount: Math.max(0, (old.subscriberCount || 0) - 1),
        };
      });
      
      queryClient.invalidateQueries({ 
        queryKey: programKeys.subscriptions() 
      });
    },
  });
}
