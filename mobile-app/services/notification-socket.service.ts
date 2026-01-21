import { io, Socket } from 'socket.io-client';
import { storage } from '@/utils/storage';
import { Notification } from '@/types/api.types';

// WebSocket event names (must match backend)
const NOTIFICATION_WS_EVENTS = {
  NEW_NOTIFICATION: 'newNotification',
  NOTIFICATION_READ: 'notificationRead',
  ALL_NOTIFICATIONS_READ: 'allNotificationsRead',
  NOTIFICATION_DELETED: 'notificationDeleted',
  UNREAD_COUNT: 'unreadCount',
  ERROR: 'error',
} as const;

type NotificationEventCallback = {
  onNewNotification?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: string) => void;
  onAllNotificationsRead?: () => void;
  onNotificationDeleted?: (notificationId: string) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onError?: (message: string) => void;
  onConnectionChange?: (connected: boolean) => void;
};

class NotificationSocketService {
  private socket: Socket | null = null;
  private callbacks: NotificationEventCallback = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  /**
   * Connect to the notification WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      console.log('[NotificationSocket] Already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      const token = await storage.getAccessToken();
      if (!token) {
        console.log('[NotificationSocket] No auth token, skipping connection');
        this.isConnecting = false;
        return;
      }

      // Get base URL from environment or config
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://iow4kgks8c0ssgs04kwgs04w.102.219.189.97.sslip.io';

      this.socket = io(`${baseUrl}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('[NotificationSocket] Connection error:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[NotificationSocket] Connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.callbacks.onConnectionChange?.(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[NotificationSocket] Disconnected:', reason);
      this.callbacks.onConnectionChange?.(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[NotificationSocket] Connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
    });

    // Handle new notification
    this.socket.on(NOTIFICATION_WS_EVENTS.NEW_NOTIFICATION, (notification: Notification) => {
      console.log('[NotificationSocket] New notification:', notification);
      this.callbacks.onNewNotification?.(notification);
    });

    // Handle notification marked as read
    this.socket.on(NOTIFICATION_WS_EVENTS.NOTIFICATION_READ, (data: { notificationId: string }) => {
      console.log('[NotificationSocket] Notification read:', data.notificationId);
      this.callbacks.onNotificationRead?.(data.notificationId);
    });

    // Handle all notifications marked as read
    this.socket.on(NOTIFICATION_WS_EVENTS.ALL_NOTIFICATIONS_READ, () => {
      console.log('[NotificationSocket] All notifications read');
      this.callbacks.onAllNotificationsRead?.();
    });

    // Handle notification deleted
    this.socket.on(NOTIFICATION_WS_EVENTS.NOTIFICATION_DELETED, (data: { notificationId: string }) => {
      console.log('[NotificationSocket] Notification deleted:', data.notificationId);
      this.callbacks.onNotificationDeleted?.(data.notificationId);
    });

    // Handle unread count update
    this.socket.on(NOTIFICATION_WS_EVENTS.UNREAD_COUNT, (data: { count: number }) => {
      console.log('[NotificationSocket] Unread count:', data.count);
      this.callbacks.onUnreadCountUpdate?.(data.count);
    });

    // Handle errors
    this.socket.on(NOTIFICATION_WS_EVENTS.ERROR, (data: { message: string }) => {
      console.error('[NotificationSocket] Error:', data.message);
      this.callbacks.onError?.(data.message);
    });
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: NotificationEventCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[NotificationSocket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Reconnect with new token (e.g., after login)
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

export const notificationSocketService = new NotificationSocketService();
