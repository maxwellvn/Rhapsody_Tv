/**
 * Push Notification Service
 * 
 * NOTE: Push notifications are currently disabled because the native modules
 * (expo-notifications, expo-device) are not included in the current APK build.
 * 
 * To enable push notifications:
 * 1. Rebuild the APK with: npx expo prebuild && cd android && ./gradlew assembleRelease
 * 2. Uncomment the code in this file and in app/_layout.tsx
 */

import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from './api.client';
import { storage } from '@/utils/storage';

class PushNotificationService {
  private expoPushToken: string | null = null;
  private initialized = false;

  /**
   * Initialize push notifications
   * Currently disabled - native modules not in build
   */
  async initialize(): Promise<boolean> {
    console.log('[PushNotification] Disabled - native modules not in build');
    return false;
  }

  /**
   * Check if notifications are available
   */
  isAvailable(): boolean {
    return false;
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    console.log('[PushNotification] Disabled - native modules not in build');
    return null;
  }

  /**
   * Register token with backend
   */
  async registerTokenWithBackend(): Promise<void> {
    console.log('[PushNotification] Disabled - native modules not in build');
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
    // Disabled
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
    // Disabled
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
    console.log('[PushNotification] Disabled - native modules not in build');
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return 0;
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    // Disabled
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    // Disabled
  }
}

export const pushNotificationService = new PushNotificationService();
