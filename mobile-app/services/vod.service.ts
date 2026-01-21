import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  ApiResponse,
  VodVideo,
  VodPaginatedVideos,
  VodComment,
  VodPaginatedComments,
  LikeStatus,
  PaginatedWatchlist,
  WatchlistStatus,
  PaginatedWatchHistory,
  WatchHistoryItem,
  UpdateWatchHistoryRequest,
} from '@/types/api.types';

/**
 * VOD (Video on Demand) Service
 * Handles all VOD-related API calls
 */
class VodService {
  /**
   * Get all public videos (paginated)
   */
  async getVideos(page: number = 1, limit: number = 20): Promise<ApiResponse<VodPaginatedVideos>> {
    return api.get<VodPaginatedVideos>(API_ENDPOINTS.VOD.LIST, {
      params: { page, limit },
    });
  }

  /**
   * Get video details (increments view count)
   */
  async getVideoDetails(videoId: string): Promise<ApiResponse<VodVideo>> {
    return api.get<VodVideo>(API_ENDPOINTS.VOD.DETAILS(videoId));
  }

  /**
   * Toggle like on video
   */
  async toggleLike(videoId: string): Promise<ApiResponse<{ liked: boolean }>> {
    return api.post<{ liked: boolean }>(API_ENDPOINTS.VOD.LIKE(videoId));
  }

  /**
   * Check if user liked video
   */
  async getLikeStatus(videoId: string): Promise<ApiResponse<LikeStatus>> {
    return api.get<LikeStatus>(API_ENDPOINTS.VOD.LIKE_STATUS(videoId));
  }

  /**
   * Get video comments (with replies)
   */
  async getComments(videoId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<VodPaginatedComments>> {
    return api.get<VodPaginatedComments>(API_ENDPOINTS.VOD.COMMENTS(videoId), {
      params: { page, limit },
    });
  }

  /**
   * Add comment to video
   */
  async addComment(videoId: string, message: string): Promise<ApiResponse<VodComment>> {
    return api.post<VodComment>(API_ENDPOINTS.VOD.COMMENTS(videoId), { message });
  }

  /**
   * Reply to a comment
   */
  async replyToComment(videoId: string, commentId: string, message: string): Promise<ApiResponse<VodComment>> {
    return api.post<VodComment>(API_ENDPOINTS.VOD.REPLY(videoId, commentId), { message });
  }

  /**
   * Delete own comment (soft delete)
   */
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(API_ENDPOINTS.VOD.DELETE_COMMENT(commentId));
  }

  /**
   * Toggle like on comment
   */
  async toggleCommentLike(commentId: string): Promise<ApiResponse<{ liked: boolean }>> {
    return api.post<{ liked: boolean }>(API_ENDPOINTS.VOD.LIKE_COMMENT(commentId));
  }

  /**
   * Check if user liked comment
   */
  async getCommentLikeStatus(commentId: string): Promise<ApiResponse<LikeStatus>> {
    return api.get<LikeStatus>(API_ENDPOINTS.VOD.COMMENT_LIKE_STATUS(commentId));
  }

  // ==================== WATCHLIST ====================

  /**
   * Get user's watchlist (paginated)
   */
  async getWatchlist(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedWatchlist>> {
    return api.get<PaginatedWatchlist>(API_ENDPOINTS.WATCHLIST.LIST, {
      params: { page, limit },
    });
  }

  /**
   * Add video to watchlist
   */
  async addToWatchlist(videoId: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>(API_ENDPOINTS.WATCHLIST.ADD(videoId));
  }

  /**
   * Remove video from watchlist
   */
  async removeFromWatchlist(videoId: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>(API_ENDPOINTS.WATCHLIST.REMOVE(videoId));
  }

  /**
   * Check if video is in watchlist
   */
  async getWatchlistStatus(videoId: string): Promise<ApiResponse<WatchlistStatus>> {
    return api.get<WatchlistStatus>(API_ENDPOINTS.WATCHLIST.STATUS(videoId));
  }

  // ==================== WATCH HISTORY ====================

  /**
   * Get user's watch history (paginated)
   */
  async getWatchHistory(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedWatchHistory>> {
    return api.get<PaginatedWatchHistory>(API_ENDPOINTS.HISTORY.LIST, {
      params: { page, limit },
    });
  }

  /**
   * Update watch progress for a video
   */
  async updateWatchHistory(
    videoId: string, 
    data: UpdateWatchHistoryRequest
  ): Promise<ApiResponse<WatchHistoryItem>> {
    return api.post<WatchHistoryItem>(API_ENDPOINTS.HISTORY.UPDATE(videoId), data);
  }

  /**
   * Remove video from watch history
   */
  async removeFromHistory(videoId: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>(API_ENDPOINTS.HISTORY.REMOVE(videoId));
  }

  /**
   * Clear all watch history
   */
  async clearWatchHistory(): Promise<ApiResponse<{ deletedCount: number }>> {
    return api.delete<{ deletedCount: number }>(API_ENDPOINTS.HISTORY.CLEAR);
  }
}

export const vodService = new VodService();
