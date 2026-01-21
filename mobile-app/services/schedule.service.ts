import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  ApiResponse,
  ScheduleProgram,
  HomepageProgram,
  DAYS_OF_WEEK,
} from '@/types/api.types';

/**
 * Schedule Service
 * Handles all schedule-related API calls
 * Note: Backend doesn't have a dedicated schedule endpoint,
 * so we use homepage/programs and transform the data
 */
class ScheduleService {
  /**
   * Get schedule programs (uses homepage/programs endpoint)
   * Filters programs to show only those relevant for the given date
   */
  async getSchedule(date?: string): Promise<ApiResponse<ScheduleProgram[]>> {
    try {
      console.log('[ScheduleService] Fetching schedule for date:', date);
      const response = await api.get<HomepageProgram[]>(API_ENDPOINTS.HOMEPAGE.PROGRAMS);
      console.log('[ScheduleService] API response success:', response?.success, 'data length:', response?.data?.length);
      
      // Ensure we have valid data
      if (!response || !response.success || !Array.isArray(response.data)) {
        console.warn('[ScheduleService] Invalid response structure:', response);
        return {
          success: true,
          message: 'No schedule data available',
          data: [],
        };
      }
      
      const targetDate = date ? new Date(date) : new Date();
      const targetDayOfWeek = targetDate.getDay();
      
      console.log('[ScheduleService] Programs from API:', response.data.map(p => ({ id: p.id, title: p.title, scheduleType: p.scheduleType })));
      
      // Transform and filter HomepageProgram to ScheduleProgram
      const schedulePrograms: ScheduleProgram[] = (response.data)
        .filter((program) => {
          const isScheduled = this.isProgramScheduledForDate(program, targetDate, targetDayOfWeek);
          console.log('[ScheduleService] Program', program.title, 'scheduleType:', program.scheduleType, 'isScheduled:', isScheduled);
          return isScheduled;
        })
        .map((program) => this.transformToScheduleProgram(program, targetDate));
      
      // Sort by time
      schedulePrograms.sort((a, b) => {
        const timeA = a.startTimeOfDay || a.startTime;
        const timeB = b.startTimeOfDay || b.startTime;
        return timeA.localeCompare(timeB);
      });
      
      return {
        success: true,
        message: 'Programs fetched successfully',
        data: schedulePrograms,
      };
    } catch (error: any) {
      console.error('[ScheduleService] Error fetching schedule:', error?.message || error);
      // Don't throw - return empty data to prevent UI crash
      return {
        success: true,
        message: 'No schedule data available',
        data: [],
      };
    }
  }

  /**
   * Check if a program is scheduled for a specific date
   */
  private isProgramScheduledForDate(
    program: HomepageProgram,
    targetDate: Date,
    targetDayOfWeek: number
  ): boolean {
    const scheduleType = program.scheduleType || 'once';
    
    // Helper to compare dates without time
    const isSameOrAfterDate = (date1: Date, date2: Date) => {
      const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
      const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
      return d1 >= d2;
    };
    
    const isSameOrBeforeDate = (date1: Date, date2: Date) => {
      const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
      const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
      return d1 <= d2;
    };
    
    // For daily/weekly, check effective date range if specified (date only, not time)
    // Skip this check if startTime/endTime are the same (not a real effective range)
    if (scheduleType !== 'once' && program.startTime && program.endTime) {
      const effectiveStart = new Date(program.startTime);
      const effectiveEnd = new Date(program.endTime);
      
      // Only apply date range filter if start and end are different dates
      const startDate = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), effectiveStart.getDate());
      const endDate = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate());
      
      if (startDate.getTime() !== endDate.getTime()) {
        if (!isSameOrAfterDate(targetDate, effectiveStart)) {
          return false;
        }
        if (!isSameOrBeforeDate(targetDate, effectiveEnd)) {
          return false;
        }
      }
    }
    
    switch (scheduleType) {
      case 'daily':
        // Daily programs show every day
        return true;
        
      case 'weekly':
        // Weekly programs show only on specified days
        const daysOfWeek = program.daysOfWeek || [];
        return daysOfWeek.includes(targetDayOfWeek);
        
      case 'once':
      default:
        // One-time programs show only on their specific date
        if (!program.startTime) return false;
        const programDate = new Date(program.startTime);
        return (
          programDate.getFullYear() === targetDate.getFullYear() &&
          programDate.getMonth() === targetDate.getMonth() &&
          programDate.getDate() === targetDate.getDate()
        );
    }
  }

  /**
   * Transform HomepageProgram to ScheduleProgram
   */
  private transformToScheduleProgram(
    program: HomepageProgram,
    targetDate: Date
  ): ScheduleProgram {
    const scheduleType = program.scheduleType || 'once';
    
    // For daily/weekly, calculate actual start/end times for the target date
    let startTime = program.startTime;
    let endTime = program.endTime;
    
    if ((scheduleType === 'daily' || scheduleType === 'weekly') && program.startTimeOfDay && program.endTimeOfDay) {
      const [startHour, startMin] = program.startTimeOfDay.split(':').map(Number);
      const [endHour, endMin] = program.endTimeOfDay.split(':').map(Number);
      
      const startDateTime = new Date(targetDate);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      const endDateTime = new Date(targetDate);
      endDateTime.setHours(endHour, endMin, 0, 0);
      
      // Handle overnight programs
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      startTime = startDateTime.toISOString();
      endTime = endDateTime.toISOString();
    }
    
    return {
      id: program.id,
      channelId: program.channel?.id || '',
      title: program.title,
      description: program.description,
      scheduleType: scheduleType,
      startTimeOfDay: program.startTimeOfDay,
      endTimeOfDay: program.endTimeOfDay,
      daysOfWeek: program.daysOfWeek,
      startTime: startTime || '',
      endTime: endTime || '',
      durationInMinutes: program.durationInMinutes,
      timezone: program.timezone,
      isLive: program.isLive,
      thumbnailUrl: program.thumbnailUrl,
      channel: program.channel ? {
        id: program.channel.id,
        name: program.channel.name,
        logoUrl: program.channel.logoUrl,
      } : undefined,
      livestreamId: program.livestreamId,
    };
  }

  /**
   * Get schedule programs for a specific channel
   */
  async getChannelSchedule(channelId: string, date?: string): Promise<ApiResponse<ScheduleProgram[]>> {
    const response = await this.getSchedule(date);
    
    if (response.success && response.data) {
      const filteredPrograms = response.data.filter(
        (program) => program.channelId === channelId
      );
      return {
        ...response,
        data: filteredPrograms,
      };
    }
    
    return response;
  }

  /**
   * Format schedule display for a program
   */
  formatScheduleDisplay(program: ScheduleProgram): string {
    const scheduleType = program.scheduleType || 'once';
    
    if (scheduleType === 'daily') {
      return `Daily at ${program.startTimeOfDay} - ${program.endTimeOfDay}`;
    }
    
    if (scheduleType === 'weekly' && program.daysOfWeek) {
      const dayNames = program.daysOfWeek
        .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.short)
        .filter(Boolean)
        .join(', ');
      return `${dayNames} at ${program.startTimeOfDay} - ${program.endTimeOfDay}`;
    }
    
    // One-time program
    if (program.startTime) {
      const date = new Date(program.startTime);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return 'Schedule not available';
  }
}

export const scheduleService = new ScheduleService();
