import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';

/**
 * Query Keys for Schedule
 */
export const scheduleKeys = {
  all: ['schedule'] as const,
  list: (date?: string) => [...scheduleKeys.all, 'list', date] as const,
  channel: (channelId: string, date?: string) => 
    [...scheduleKeys.all, 'channel', channelId, date] as const,
};

/**
 * Get schedule programs
 */
export function useSchedule(date?: string) {
  return useQuery({
    queryKey: scheduleKeys.list(date),
    queryFn: async () => {
      try {
        console.log('[useSchedule] Fetching schedule for date:', date);
        const response = await scheduleService.getSchedule(date);
        console.log('[useSchedule] Got response, data length:', response?.data?.length);
        return response.data || [];
      } catch (error) {
        console.error('[useSchedule] Schedule fetch failed:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refetch every minute for live status updates
  });
}

/**
 * Get channel-specific schedule
 */
export function useChannelSchedule(channelId: string, date?: string) {
  return useQuery({
    queryKey: scheduleKeys.channel(channelId, date),
    queryFn: async () => {
      const response = await scheduleService.getChannelSchedule(channelId, date);
      return response.data;
    },
    enabled: !!channelId,
    refetchInterval: 60000,
  });
}
