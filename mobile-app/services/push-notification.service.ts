/**
 * Push Notification Service
 * Handles Expo push notifications registration and handling
 */

import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { api } from './api.client';
import { storage } from '@/utils/storage';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  private expoPushToken: string | null = null;
  private initialized = false;
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      const token = await this.registerForPushNotifications();
      if (token) {
        this.expoPushToken = token;
        await this.registerTokenWithBackend();
        this.setupListeners();
        this.initialized = true;
        console.log('[PushNotification] Initialized with token:', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PushNotification] Initialization error:', error);
      return false;
    }
  }

  /**
   * Check if notifications are available
   */
  isAvailable(): boolean {
    return Device.isDevice && this.initialized;
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('[PushNotification] Must use physical device for push notifications');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PushNotification] Permission not granted');
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = tokenData.data;
      console.log('[PushNotification] Got token:', token);

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      return token;
    } catch (error) {
      console.error('[PushNotification] Error getting push token:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  async registerTokenWithBackend(): Promise<void> {
    if (!this.expoPushToken) {
      console.log('[PushNotification] No token to register');
      return;
    }

    try {
      // Check if user is authenticated
      const accessToken = await storage.getAccessToken();
      if (!accessToken) {
        console.log('[PushNotification] User not authenticated, skipping registration');
        return;
      }

      await api.post('/notifications/register-token', {
        token: this.expoPushToken,
        platform: 'expo',
        deviceId: Constants.deviceId,
      });
      console.log('[PushNotification] Token registered with backend');
    } catch (error) {
      console.error('[PushNotification] Error registering token with backend:', error);
    }
  }

  /**
   * Unregister token from backend
   */
  async unregisterToken(): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      await api.post('/notifications/unregister-token', {
        token: this.expoPushToken,
      });
      console.log('[PushNotification] Token unregistered');
    } catch (error) {
      console.error('[PushNotification] Error unregistering token:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(): void {
    // Listen for incoming notifications while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushNotification] Received:', notification);
      }
    );

    // Listen for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[PushNotification] Tapped:', data);
        this.handleNotificationTap(data);
      }
    );
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   */
  handleNotificationTap(data: any): void {
    console.log('[PushNotification] Handling tap with data:', data);

    if (data?.videoId) {
      router.push(`/video?id=${data.videoId}`);
    } else if (data?.livestreamId) {
      router.push(`/live-video?id=${data.livestreamId}`);
    } else if (data?.channelId) {
      router.push(`/channel-profile?id=${data.channelId}`);
    } else if (data?.programId) {
      router.push(`/program-profile?id=${data.programId}`);
    } else {
      router.push('/notifications');
    }
  }

  /**
   * Remove listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * Get current push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    seconds: number = 1
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
    });
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Re-register token after login
   * Call this when user logs in to ensure token is associated with user
   */
  async onUserLogin(): Promise<void> {
    if (this.expoPushToken) {
      await this.registerTokenWithBackend();
    } else {
      await this.initialize();
    }
  }

  /**
   * Cleanup on logout
   */
  async onUserLogout(): Promise<void> {
    await this.unregisterToken();
  }
}

export const pushNotificationService = new PushNotificationService();
