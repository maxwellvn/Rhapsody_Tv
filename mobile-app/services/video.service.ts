import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  Video,
  VideoListParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api.types';

/**
 * Video Service
 * Handles video-related API calls using the VOD endpoints
 */
class VideoService {
  /**
   * Get list of videos
   */
  async getVideos(params?: VideoListParams): Promise<ApiResponse<PaginatedResponse<Video>>> {
    return api.get<PaginatedResponse<Video>>(API_ENDPOINTS.VOD.LIST, {
      params,
    });
  }

  /**
   * Get trending videos (uses VOD list with sorting)
   */
  async getTrendingVideos(params?: VideoListParams): Promise<ApiResponse<PaginatedResponse<Video>>> {
    return api.get<PaginatedResponse<Video>>(API_ENDPOINTS.VOD.LIST, {
      params: { ...params, sortBy: 'viewCount' },
    });
  }

  /**
   * Get recommended videos (uses VOD list)
   */
  async getRecommendedVideos(params?: VideoListParams): Promise<ApiResponse<PaginatedResponse<Video>>> {
    return api.get<PaginatedResponse<Video>>(API_ENDPOINTS.VOD.LIST, {
      params,
    });
  }

  /**
   * Search videos (uses VOD list with search param)
   */
  async searchVideos(query: string, params?: VideoListParams): Promise<ApiResponse<PaginatedResponse<Video>>> {
    return api.get<PaginatedResponse<Video>>(API_ENDPOINTS.VOD.LIST, {
      params: { ...params, search: query },
    });
  }

  /**
   * Get video details
   */
  async getVideoDetails(videoId: string): Promise<ApiResponse<Video>> {
    return api.get<Video>(API_ENDPOINTS.VOD.DETAILS(videoId));
  }

  /**
   * Get related videos (uses VOD list for now)
   */
  async getRelatedVideos(videoId: string): Promise<ApiResponse<Video[]>> {
    // TODO: Implement related videos endpoint in backend
    return api.get<Video[]>(API_ENDPOINTS.VOD.LIST);
  }

  /**
   * Get video stream URL (returns video details which include playback URL)
   */
  async getStreamUrl(videoId: string): Promise<ApiResponse<{ streamUrl: string }>> {
    const response = await api.get<Video>(API_ENDPOINTS.VOD.DETAILS(videoId));
    return {
      ...response,
      data: { streamUrl: (response.data as any)?.playbackUrl || '' },
    };
  }

  /**
   * Like a video
   */
  async likeVideo(videoId: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.VOD.LIKE(videoId));
  }

  /**
   * Unlike a video (toggle - same endpoint)
   */
  async unlikeVideo(videoId: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.VOD.LIKE(videoId));
  }

  /**
   * Check if user liked a video
   */
  async getLikeStatus(videoId: string): Promise<ApiResponse<{ isLiked: boolean }>> {
    return api.get<{ isLiked: boolean }>(API_ENDPOINTS.VOD.LIKE_STATUS(videoId));
  }

  /**
   * Record video view - not available in current backend, use update-progress instead
   */
  async recordView(videoId: string, watchTime?: number): Promise<ApiResponse<void>> {
    // Use homepage update-progress endpoint
    return api.post<void>(API_ENDPOINTS.HOMEPAGE.UPDATE_PROGRESS, {
      videoId,
      progressSeconds: watchTime || 0,
      durationSeconds: 0,
    });
  }
}

export const videoService = new VideoService();
