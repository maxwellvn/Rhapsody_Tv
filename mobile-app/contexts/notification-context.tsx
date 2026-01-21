import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationSocketService } from '@/services/notification-socket.service';
import { notificationKeys } from '@/hooks/queries/useNotificationQueries';
import { Notification } from '@/types/api.types';
import { useAuth } from '@/context/AuthContext';

interface NotificationContextType {
  unreadCount: number;
  isConnected: boolean;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
  }, [queryClient]);

  useEffect(() => {
    if (!isAuthenticated) {
      notificationSocketService.disconnect();
      setUnreadCount(0);
      setIsConnected(false);
      return;
    }

    // Setup callbacks
    notificationSocketService.setCallbacks({
      onNewNotification: (notification: Notification) => {
        // Add new notification to the cache
        queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      },
      onNotificationRead: (notificationId: string) => {
        // Update the notification in cache
        queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      },
      onAllNotificationsRead: () => {
        setUnreadCount(0);
        queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
        queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 });
      },
      onNotificationDeleted: (notificationId: string) => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      },
      onUnreadCountUpdate: (count: number) => {
        setUnreadCount(count);
        queryClient.setQueryData(notificationKeys.unreadCount(), { count });
      },
      onConnectionChange: (connected: boolean) => {
        setIsConnected(connected);
      },
      onError: (message: string) => {
        console.error('[NotificationContext] Socket error:', message);
      },
    });

    // Connect to socket
    notificationSocketService.connect();

    return () => {
      notificationSocketService.disconnect();
    };
  }, [isAuthenticated, queryClient]);

  // Sync unread count from query cache
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'notifications' && event.query.queryKey[1] === 'unread-count') {
        const data = event.query.state.data as { count: number } | undefined;
        if (data?.count !== undefined) {
          setUnreadCount(data.count);
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <NotificationContext.Provider value={{ unreadCount, isConnected, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
