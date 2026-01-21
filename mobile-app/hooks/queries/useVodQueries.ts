import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { vodService } from '@/services/vod.service';

/**
 * Query Keys for VOD
 */
export const vodKeys = {
  all: ['vod'] as const,
  videos: () => [...vodKeys.all, 'videos'] as const,
  videoList: (page: number, limit: number) => [...vodKeys.videos(), page, limit] as const,
  detail: (id: string) => [...vodKeys.all, 'detail', id] as const,
  likeStatus: (id: string) => [...vodKeys.all, 'like-status', id] as const,
  comments: (videoId: string) => [...vodKeys.all, 'comments', videoId] as const,
  commentList: (videoId: string, page: number, limit: number) => 
    [...vodKeys.comments(videoId), page, limit] as const,
  commentLikeStatus: (commentId: string) => [...vodKeys.all, 'comment-like-status', commentId] as const,
  // Watchlist keys
  watchlist: () => [...vodKeys.all, 'watchlist'] as const,
  watchlistPaginated: (page: number, limit: number) => [...vodKeys.watchlist(), page, limit] as const,
  watchlistStatus: (videoId: string) => [...vodKeys.all, 'watchlist-status', videoId] as const,
  // History keys
  history: () => [...vodKeys.all, 'history'] as const,
  historyPaginated: (page: number, limit: number) => [...vodKeys.history(), page, limit] as const,
};

/**
 * Get paginated list of VOD videos
 */
export function useVodVideos(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: vodKeys.videoList(page, limit),
    queryFn: async () => {
      const response = await vodService.getVideos(page, limit);
      return response.data;
    },
  });
}

/**
 * Get infinite scroll for VOD videos
 */
export function useInfiniteVodVideos(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: vodKeys.videos(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await vodService.getVideos(pageParam, limit);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Get video details
 */
export function useVodVideoDetails(videoId: string) {
  return useQuery({
    queryKey: vodKeys.detail(videoId),
    queryFn: async () => {
      const response = await vodService.getVideoDetails(videoId);
      return response.data;
    },
    enabled: !!videoId,
  });
}

/**
 * Get video like status
 */
export function useVodLikeStatus(videoId: string) {
  return useQuery({
    queryKey: vodKeys.likeStatus(videoId),
    queryFn: async () => {
      const response = await vodService.getLikeStatus(videoId);
      return response.data;
    },
    enabled: !!videoId,
  });
}

/**
 * Toggle like on video
 */
export function useToggleVodLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await vodService.toggleLike(videoId);
      return { videoId, liked: response.data.liked };
    },
    onSuccess: ({ videoId, liked }) => {
      // Update like status cache
      queryClient.setQueryData(vodKeys.likeStatus(videoId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          liked,
          likeCount: liked ? old.likeCount + 1 : Math.max(0, old.likeCount - 1),
        };
      });

      // Update video detail cache
      queryClient.setQueryData(vodKeys.detail(videoId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likeCount: liked ? old.likeCount + 1 : Math.max(0, old.likeCount - 1),
        };
      });
    },
  });
}

/**
 * Get video comments
 */
export function useVodComments(videoId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: vodKeys.commentList(videoId, page, limit),
    queryFn: async () => {
      const response = await vodService.getComments(videoId, page, limit);
      return response.data;
    },
    enabled: !!videoId,
  });
}

/**
 * Get infinite scroll for comments
 */
export function useInfiniteVodComments(videoId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: vodKeys.comments(videoId),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await vodService.getComments(videoId, pageParam, limit);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!videoId,
  });
}

/**
 * Add comment to video
 */
export function useAddVodComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, message }: { videoId: string; message: string }) => {
      const response = await vodService.addComment(videoId, message);
      return { videoId, comment: response.data };
    },
    onSuccess: ({ videoId }) => {
      // Invalidate comments to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.comments(videoId),
      });

      // Update video detail comment count
      queryClient.setQueryData(vodKeys.detail(videoId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: old.commentCount + 1,
        };
      });
    },
  });
}

/**
 * Reply to a comment
 */
export function useReplyToComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      videoId, 
      commentId, 
      message 
    }: { 
      videoId: string; 
      commentId: string; 
      message: string 
    }) => {
      const response = await vodService.replyToComment(videoId, commentId, message);
      return { videoId, comment: response.data };
    },
    onSuccess: ({ videoId }) => {
      // Invalidate comments to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.comments(videoId),
      });
    },
  });
}

/**
 * Delete own comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, commentId }: { videoId: string; commentId: string }) => {
      await vodService.deleteComment(commentId);
      return { videoId, commentId };
    },
    onSuccess: ({ videoId }) => {
      // Invalidate comments to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.comments(videoId),
      });

      // Update video detail comment count
      queryClient.setQueryData(vodKeys.detail(videoId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: Math.max(0, old.commentCount - 1),
        };
      });
    },
  });
}

/**
 * Toggle like on comment
 */
export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, commentId }: { videoId: string; commentId: string }) => {
      const response = await vodService.toggleCommentLike(commentId);
      return { videoId, commentId, liked: response.data.liked };
    },
    onSuccess: ({ videoId }) => {
      // Invalidate comments to refetch with updated like counts
      queryClient.invalidateQueries({
        queryKey: vodKeys.comments(videoId),
      });
    },
  });
}

// ==================== WATCHLIST HOOKS ====================

/**
 * Get user's watchlist (paginated)
 */
export function useWatchlist(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: vodKeys.watchlistPaginated(page, limit),
    queryFn: async () => {
      const response = await vodService.getWatchlist(page, limit);
      return response.data;
    },
  });
}

/**
 * Get infinite scroll for watchlist
 */
export function useInfiniteWatchlist(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: vodKeys.watchlist(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await vodService.getWatchlist(pageParam, limit);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Check if video is in watchlist
 */
export function useWatchlistStatus(videoId: string) {
  return useQuery({
    queryKey: vodKeys.watchlistStatus(videoId),
    queryFn: async () => {
      const response = await vodService.getWatchlistStatus(videoId);
      return response.data;
    },
    enabled: !!videoId,
  });
}

/**
 * Add video to watchlist
 */
export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await vodService.addToWatchlist(videoId);
      return { videoId, message: response.data.message };
    },
    onSuccess: ({ videoId }) => {
      // Update watchlist status cache
      queryClient.setQueryData(vodKeys.watchlistStatus(videoId), { inWatchlist: true });
      // Invalidate watchlist to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.watchlist(),
      });
    },
  });
}

/**
 * Remove video from watchlist
 */
export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await vodService.removeFromWatchlist(videoId);
      return { videoId, message: response.data.message };
    },
    onSuccess: ({ videoId }) => {
      // Update watchlist status cache
      queryClient.setQueryData(vodKeys.watchlistStatus(videoId), { inWatchlist: false });
      // Invalidate watchlist to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.watchlist(),
      });
    },
  });
}

// ==================== WATCH HISTORY HOOKS ====================

/**
 * Get user's watch history (paginated)
 */
export function useWatchHistory(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: vodKeys.historyPaginated(page, limit),
    queryFn: async () => {
      const response = await vodService.getWatchHistory(page, limit);
      return response.data;
    },
  });
}

/**
 * Get infinite scroll for watch history
 */
export function useInfiniteWatchHistory(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: vodKeys.history(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await vodService.getWatchHistory(pageParam, limit);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Update watch progress for a video
 */
export function useUpdateWatchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      videoId, 
      watchedSeconds, 
      totalDurationSeconds 
    }: { 
      videoId: string; 
      watchedSeconds: number; 
      totalDurationSeconds: number;
    }) => {
      const response = await vodService.updateWatchHistory(videoId, {
        watchedSeconds,
        totalDurationSeconds,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate history to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.history(),
      });
    },
  });
}

/**
 * Remove video from watch history
 */
export function useRemoveFromHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await vodService.removeFromHistory(videoId);
      return { videoId, message: response.data.message };
    },
    onSuccess: () => {
      // Invalidate history to refetch
      queryClient.invalidateQueries({
        queryKey: vodKeys.history(),
      });
    },
  });
}

/**
 * Clear all watch history
 */
export function useClearWatchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await vodService.clearWatchHistory();
      return response.data;
    },
    onSuccess: () => {
      // Invalidate history to refetch (will be empty)
      queryClient.invalidateQueries({
        queryKey: vodKeys.history(),
      });
    },
  });
}
