import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  ApiResponse,
  Livestream,
  HomepageLivestream,
  LivestreamStatus,
} from '@/types/api.types';

interface LivestreamsResponse {
  livestreams: Livestream[];
}

interface HomepageLivestreamsResponse {
  livestreams: HomepageLivestream[];
}

/**
 * Livestream Service
 * Handles all livestream-related API calls
 */
class LivestreamService {
  /**
   * Get all active livestreams (live and scheduled)
   */
  async getLivestreams(options?: {
    status?: LivestreamStatus;
    channelId?: string;
    programId?: string;
    limit?: number;
  }): Promise<ApiResponse<LivestreamsResponse>> {
    const params: Record<string, string | number> = {};
    if (options?.status) params.status = options.status;
    if (options?.channelId) params.channelId = options.channelId;
    if (options?.programId) params.programId = options.programId;
    if (options?.limit) params.limit = options.limit;

    return api.get<LivestreamsResponse>(API_ENDPOINTS.LIVESTREAMS.LIST, { params });
  }

  /**
   * Get currently live streams only
   */
  async getLiveNow(): Promise<ApiResponse<LivestreamsResponse>> {
    return api.get<LivestreamsResponse>(API_ENDPOINTS.LIVESTREAMS.LIVE_NOW);
  }

  /**
   * Get upcoming scheduled livestreams
   */
  async getUpcoming(limit = 10): Promise<ApiResponse<LivestreamsResponse>> {
    return api.get<LivestreamsResponse>(API_ENDPOINTS.LIVESTREAMS.UPCOMING, {
      params: { limit },
    });
  }

  /**
   * Get livestreams by channel
   */
  async getByChannel(channelId: string, includeEnded = false): Promise<ApiResponse<LivestreamsResponse>> {
    return api.get<LivestreamsResponse>(API_ENDPOINTS.LIVESTREAMS.BY_CHANNEL(channelId), {
      params: { includeEnded: includeEnded.toString() },
    });
  }

  /**
   * Get livestreams by program
   */
  async getByProgram(programId: string, includeEnded = false): Promise<ApiResponse<LivestreamsResponse>> {
    return api.get<LivestreamsResponse>(API_ENDPOINTS.LIVESTREAMS.BY_PROGRAM(programId), {
      params: { includeEnded: includeEnded.toString() },
    });
  }

  /**
   * Get a single livestream by ID
   */
  async getById(id: string): Promise<ApiResponse<Livestream>> {
    return api.get<Livestream>(API_ENDPOINTS.LIVESTREAMS.DETAILS(id));
  }

  /**
   * Get homepage livestreams (formatted for homepage display)
   */
  async getHomepageLivestreams(limit = 10): Promise<ApiResponse<HomepageLivestream[]>> {
    return api.get<HomepageLivestream[]>(API_ENDPOINTS.HOMEPAGE.LIVESTREAMS, {
      params: { limit },
    });
  }

  /**
   * Get livestream stats (viewer count, like count)
   */
  async getStats(livestreamId: string): Promise<ApiResponse<{
    viewerCount: number;
    likeCount: number;
    isLive: boolean;
  }>> {
    return api.get(API_ENDPOINTS.LIVESTREAMS.STATS(livestreamId));
  }

  /**
   * Get like status for a livestream
   */
  async getLikeStatus(livestreamId: string): Promise<ApiResponse<{
    liked: boolean;
    likeCount: number;
  }>> {
    return api.get(API_ENDPOINTS.LIVESTREAMS.LIKE_STATUS(livestreamId));
  }

  /**
   * Toggle like on a livestream
   */
  async toggleLike(livestreamId: string): Promise<ApiResponse<{
    liked: boolean;
    message: string;
  }>> {
    return api.post(API_ENDPOINTS.LIVESTREAMS.LIKE(livestreamId));
  }
}

export const livestreamService = new LivestreamService();
