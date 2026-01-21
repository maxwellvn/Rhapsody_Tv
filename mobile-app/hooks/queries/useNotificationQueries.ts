import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

/**
 * Query Keys for Notifications
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  listPaginated: (page: number, limit: number) => [...notificationKeys.list(), page, limit] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

/**
 * Get paginated notifications
 */
export function useNotifications(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: notificationKeys.listPaginated(page, limit),
    queryFn: async () => {
      const response = await notificationService.getNotifications(page, limit);
      return response.data;
    },
  });
}

/**
 * Get infinite scroll for notifications
 */
export function useInfiniteNotifications(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await notificationService.getNotifications(pageParam, limit);
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
 * Get unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await notificationService.getUnreadCount();
      return response.data;
    },
    // Refetch periodically to keep count updated
    refetchInterval: 60000, // 1 minute
  });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationService.markAsRead(notificationId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationService.markAllAsRead();
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });
      // Set unread count to 0
      queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 });
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    },
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });
      // Invalidate unread count in case deleted notification was unread
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}
