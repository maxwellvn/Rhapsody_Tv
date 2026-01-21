import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { homepageService } from '@/services/homepage.service';
import { livestreamService } from '@/services/livestream.service';
import { UpdateProgressRequest } from '@/types/api.types';

/**
 * Query Keys for Homepage
 */
export const homepageKeys = {
  all: ['homepage'] as const,
  liveNow: () => [...homepageKeys.all, 'live-now'] as const,
  continueWatching: () => [...homepageKeys.all, 'continue-watching'] as const,
  channels: (limit?: number) => [...homepageKeys.all, 'channels', limit] as const,
  programs: (limit?: number) => [...homepageKeys.all, 'programs', limit] as const,
  featuredVideos: (limit?: number) => [...homepageKeys.all, 'featured-videos', limit] as const,
  programHighlights: (limit?: number) => [...homepageKeys.all, 'program-highlights', limit] as const,
  livestreams: (limit?: number) => [...homepageKeys.all, 'livestreams', limit] as const,
  livestream: (id: string) => [...homepageKeys.all, 'livestream', id] as const,
  livestreamStats: (id: string) => [...homepageKeys.all, 'livestream-stats', id] as const,
  livestreamLikeStatus: (id: string) => [...homepageKeys.all, 'livestream-like-status', id] as const,
};

/**
 * Get live now program
 */
export function useLiveNow() {
  return useQuery({
    queryKey: homepageKeys.liveNow(),
    queryFn: async () => {
      const response = await homepageService.getLiveNow();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live status
  });
}

/**
 * Get continue watching list
 */
export function useContinueWatching() {
  return useQuery({
    queryKey: homepageKeys.continueWatching(),
    queryFn: async () => {
      const response = await homepageService.getContinueWatching();
      return response.data;
    },
  });
}

/**
 * Get channels list
 */
export function useHomepageChannels(limit: number = 10) {
  return useQuery({
    queryKey: homepageKeys.channels(limit),
    queryFn: async () => {
      const response = await homepageService.getChannels(limit);
      return response.data;
    },
  });
}

/**
 * Get programs list
 */
export function useHomepagePrograms(limit: number = 10) {
  return useQuery({
    queryKey: homepageKeys.programs(limit),
    queryFn: async () => {
      const response = await homepageService.getPrograms(limit);
      return response.data;
    },
  });
}

/**
 * Get featured videos
 */
export function useFeaturedVideos(limit: number = 10) {
  return useQuery({
    queryKey: homepageKeys.featuredVideos(limit),
    queryFn: async () => {
      const response = await homepageService.getFeaturedVideos(limit);
      return response.data;
    },
  });
}

/**
 * Get program highlights
 */
export function useProgramHighlights(limit: number = 10) {
  return useQuery({
    queryKey: homepageKeys.programHighlights(limit),
    queryFn: async () => {
      const response = await homepageService.getProgramHighlights(limit);
      return response.data;
    },
  });
}

/**
 * Get livestreams for homepage
 */
export function useHomepageLivestreams(limit: number = 10) {
  return useQuery({
    queryKey: homepageKeys.livestreams(limit),
    queryFn: async () => {
      const response = await livestreamService.getHomepageLivestreams(limit);
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live status updates
  });
}

/**
 * Get livestream details for watching
 */
export function useLivestream(livestreamId: string) {
  return useQuery({
    queryKey: homepageKeys.livestream(livestreamId),
    queryFn: async () => {
      const response = await homepageService.watchLivestream(livestreamId);
      return response.data;
    },
    enabled: !!livestreamId,
  });
}

/**
 * Update video watch progress mutation
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProgressRequest) => {
      const response = await homepageService.updateProgress(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate continue watching list to show updated progress
      queryClient.invalidateQueries({
        queryKey: homepageKeys.continueWatching(),
      });
    },
  });
}

// ==================== LIVESTREAM HOOKS ====================

/**
 * Get livestream stats (viewer count, like count) - polls every 10 seconds
 */
export function useLivestreamStats(livestreamId: string) {
  return useQuery({
    queryKey: homepageKeys.livestreamStats(livestreamId),
    queryFn: async () => {
      const response = await livestreamService.getStats(livestreamId);
      return response.data;
    },
    enabled: !!livestreamId,
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });
}

/**
 * Get livestream like status
 */
export function useLivestreamLikeStatus(livestreamId: string) {
  return useQuery({
    queryKey: homepageKeys.livestreamLikeStatus(livestreamId),
    queryFn: async () => {
      const response = await livestreamService.getLikeStatus(livestreamId);
      return response.data;
    },
    enabled: !!livestreamId,
  });
}

/**
 * Toggle like on livestream
 */
export function useToggleLivestreamLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (livestreamId: string) => {
      const response = await livestreamService.toggleLike(livestreamId);
      return { livestreamId, ...response.data };
    },
    onSuccess: ({ livestreamId, liked }) => {
      // Update like status cache
      queryClient.setQueryData(homepageKeys.livestreamLikeStatus(livestreamId), (old: any) => ({
        ...old,
        liked,
        likeCount: liked 
          ? (old?.likeCount || 0) + 1 
          : Math.max(0, (old?.likeCount || 0) - 1),
      }));
      
      // Update stats cache
      queryClient.setQueryData(homepageKeys.livestreamStats(livestreamId), (old: any) => ({
        ...old,
        likeCount: liked 
          ? (old?.likeCount || 0) + 1 
          : Math.max(0, (old?.likeCount || 0) - 1),
      }));
    },
  });
}
