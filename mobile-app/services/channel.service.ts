import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  ApiResponse,
  ChannelDetail,
  VodPaginatedVideos,
} from '@/types/api.types';

/**
 * Channel Service
 * Handles all channel-related API calls
 */
class ChannelService {
  /**
   * Get channel details by ID
   */
  async getChannelDetails(channelId: string): Promise<ApiResponse<ChannelDetail>> {
    try {
      const response = await api.get<ChannelDetail>(API_ENDPOINTS.CHANNELS.DETAILS(channelId));
      return response;
    } catch (error: any) {
      console.error('Error fetching channel details:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch channel details',
        data: null as any,
      };
    }
  }

  /**
   * Get channel details by slug
   */
  async getChannelBySlug(slug: string): Promise<ApiResponse<ChannelDetail>> {
    return api.get<ChannelDetail>(API_ENDPOINTS.CHANNELS.BY_SLUG(slug));
  }

  /**
   * Get all channels (paginated)
   */
  async getChannels(page: number = 1, limit: number = 20): Promise<ApiResponse<ChannelDetail[]>> {
    return api.get<ChannelDetail[]>(API_ENDPOINTS.CHANNELS.LIST, {
      params: { page, limit },
    });
  }

  /**
   * Get channel videos - Note: Backend doesn't have this endpoint
   * Returns empty result for now
   */
  async getChannelVideos(channelId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<VodPaginatedVideos>> {
    // The backend doesn't have a channel videos endpoint
    // Return empty paginated response
    return {
      success: true,
      message: 'No channel videos endpoint available',
      data: {
        videos: [],
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0,
      },
    };
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channelId: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.CHANNELS.SUBSCRIBE(channelId));
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channelId: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.CHANNELS.UNSUBSCRIBE(channelId));
  }

  /**
   * Get user's subscriptions
   */
  async getSubscriptions(): Promise<ApiResponse<ChannelDetail[]>> {
    return api.get<ChannelDetail[]>(API_ENDPOINTS.CHANNELS.SUBSCRIPTIONS);
  }

  /**
   * Check if user is subscribed to a channel
   */
  async getSubscriptionStatus(channelId: string): Promise<ApiResponse<{ isSubscribed: boolean }>> {
    return api.get<{ isSubscribed: boolean }>(API_ENDPOINTS.CHANNELS.SUBSCRIPTION_STATUS(channelId));
  }
}

export const channelService = new ChannelService();
