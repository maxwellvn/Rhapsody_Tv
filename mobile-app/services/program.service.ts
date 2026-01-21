import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  ApiResponse,
  HomepageProgram,
  ProgramDetail,
  VodPaginatedVideos,
} from '@/types/api.types';

/**
 * Program Service
 * Handles all program-related API calls
 */
class ProgramService {
  /**
   * Get all programs
   */
  async getPrograms(limit?: number): Promise<ApiResponse<HomepageProgram[]>> {
    try {
      const response = await api.get<HomepageProgram[]>(API_ENDPOINTS.HOMEPAGE.PROGRAMS, {
        params: { limit: limit || 50 },
      });
      return response;
    } catch (error) {
      console.error('Error fetching programs:', error);
      return {
        success: true,
        message: 'No programs available',
        data: [],
      };
    }
  }

  /**
   * Get a single program by ID using public /programs/:id endpoint
   */
  async getProgramById(programId: string): Promise<ApiResponse<ProgramDetail | null>> {
    try {
      console.log('Fetching program with ID:', programId);
      
      // Use the public programs endpoint
      const response = await api.get<any>(API_ENDPOINTS.PROGRAMS.DETAILS(programId));
      
      console.log('Program API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        const program = response.data;
        
        // Transform backend response to ProgramDetail
        // Backend returns channelId as populated object
        const channel = program.channelId;
        const programDetail: ProgramDetail = {
          id: program._id || program.id,
          channelId: typeof channel === 'object' ? (channel._id || channel.id) : channel,
          title: program.title,
          description: program.description,
          scheduleType: program.scheduleType,
          startTimeOfDay: program.startTimeOfDay,
          endTimeOfDay: program.endTimeOfDay,
          daysOfWeek: program.daysOfWeek,
          startTime: program.startTime,
          endTime: program.endTime,
          durationInMinutes: program.durationInMinutes,
          timezone: program.timezone,
          coverImageUrl: program.thumbnailUrl || (typeof channel === 'object' ? channel.coverImageUrl : undefined),
          thumbnailUrl: program.thumbnailUrl,
          category: program.category,
          channel: typeof channel === 'object' ? {
            id: channel._id || channel.id,
            name: channel.name,
            logoUrl: channel.logoUrl,
          } : undefined,
          subscriberCount: program.bookmarkCount || 0,
          videoCount: 0,
        };
        
        return {
          success: true,
          message: 'Program retrieved successfully',
          data: programDetail,
        };
      }
      
      return {
        success: false,
        message: 'Program not found',
        data: null,
      };
    } catch (error: any) {
      console.error('Error fetching program:', error);
      console.error('Error details:', error?.message, error?.statusCode);
      return {
        success: false,
        message: error?.message || 'Failed to fetch program',
        data: null,
      };
    }
  }

  /**
   * Get videos for a program
   * Note: Backend doesn't have a /programs/:id/videos endpoint,
   * so we use VOD endpoint and filter by program
   */
  async getProgramVideos(
    programId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<VodPaginatedVideos>> {
    try {
      // Get VOD videos - in a real implementation,
      // we would filter by program ID if the backend supports it
      const response = await api.get<VodPaginatedVideos>(API_ENDPOINTS.VOD.LIST, {
        params: {
          page,
          limit,
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching program videos:', error);
      return {
        success: true,
        message: 'No videos available',
        data: {
          videos: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }
  }

  /**
   * Subscribe to a program
   */
  async subscribe(programId: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.PROGRAMS.SUBSCRIBE(programId));
  }

  /**
   * Unsubscribe from a program
   */
  async unsubscribe(programId: string): Promise<ApiResponse<void>> {
    return api.post<void>(API_ENDPOINTS.PROGRAMS.UNSUBSCRIBE(programId));
  }

  /**
   * Get user's program subscriptions
   */
  async getSubscriptions(): Promise<ApiResponse<ProgramDetail[]>> {
    return api.get<ProgramDetail[]>(API_ENDPOINTS.PROGRAMS.SUBSCRIPTIONS);
  }

  /**
   * Check if user is subscribed to a program
   */
  async getSubscriptionStatus(programId: string): Promise<ApiResponse<{ isSubscribed: boolean }>> {
    return api.get<{ isSubscribed: boolean }>(API_ENDPOINTS.PROGRAMS.SUBSCRIPTION_STATUS(programId));
  }
}

export const programService = new ProgramService();
