import { api } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  ApiResponse,
  Notification,
  PaginatedNotifications,
} from '@/types/api.types';

/**
 * Notification Service
 * Handles all notification-related API calls
 */
class NotificationService {
  /**
   * Get user notifications (paginated)
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedNotifications>> {
    return api.get<PaginatedNotifications>(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page, limit },
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return api.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return api.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ modifiedCount: number }>> {
    return api.post<{ modifiedCount: number }>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
  }
}

export const notificationService = new NotificationService();
