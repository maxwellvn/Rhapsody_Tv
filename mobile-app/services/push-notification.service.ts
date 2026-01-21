import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from './api.client';
import { storage } from '@/utils/storage';

// Lazy load expo-notifications to prevent crash if native module is missing
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let Constants: typeof import('expo-constants').default | null = null;

let isNotificationsAvailable = false;

// Try to load notifications modules
async function loadNotificationModules(): Promise<boolean> {
  if (isNotificationsAvailable) return true;
  
  try {
    Notifications = await import('expo-notifications');
    Device = await import('expo-device');
    const constantsModule = await import('expo-constants');
    Constants = constantsModule.default;
    
    // Test if the native module is actually available
    await Notifications.getPermissionsAsync();
    
    isNotificationsAvailable = true;
    
    // Configure how notifications are displayed when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    console.log('[PushNotification] Modules loaded successfully');
    return true;
  } catch (error) {
    console.log('[PushNotification] Native module not available:', error);
    isNotificationsAvailable = false;
    return false;
  }
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private initialized = false;

  /**
   * Initialize push notifications - call this before using other methods
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return isNotificationsAvailable;
    
    this.initialized = true;
    const available = await loadNotificationModules();
    
    if (available) {
      this.setupListeners();
    }
    
    return available;
  }

  /**
   * Check if notifications are available
   */
  isAvailable(): boolean {
    return isNotificationsAvailable;
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!isNotificationsAvailable || !Notifications || !Device || !Constants) {
        console.log('[PushNotification] Notifications not available');
        return null;
      }

      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('[PushNotification] Push notifications require a physical device');
        return null;
      }

      // Check permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PushNotification] Permission not granted');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      this.expoPushToken = tokenData.data;

      console.log('[PushNotification] Token:', this.expoPushToken);

      // Setup Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('[PushNotification] Error registering:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  async registerTokenWithBackend(): Promise<void> {
    try {
      if (!isNotificationsAvailable || !Device) {
        console.log('[PushNotification] Notifications not available');
        return;
      }

      const token = this.expoPushToken || await this.registerForPushNotifications();
      if (!token) {
        console.log('[PushNotification] No token to register');
        return;
      }

      // Check if user is logged in
      const accessToken = await storage.getAccessToken();
      if (!accessToken) {
        console.log('[PushNotification] User not logged in, skipping backend registration');
        return;
      }

      await api.post('/notifications/register-token', {
        token,
        platform: 'expo',
        deviceId: Device.modelId || undefined,
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
    try {
      if (!this.expoPushToken) return;

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
    if (!isNotificationsAvailable || !Notifications) return;

    // Handle notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushNotification] Notification received:', notification);
      }
    );

    // Handle user tapping on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[PushNotification] Notification tapped:', response);
        this.handleNotificationTap(response.notification.request.content.data);
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
      // Default to notifications screen
      router.push('/notifications');
    }
  }

  /**
   * Remove listeners
   */
  removeListeners(): void {
    if (!Notifications) return;

    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
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
    if (!isNotificationsAvailable || !Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds },
    });
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    if (!isNotificationsAvailable || !Notifications) return 0;
    return Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!isNotificationsAvailable || !Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    if (!isNotificationsAvailable || !Notifications) return;
    await Notifications.dismissAllNotificationsAsync();
    await this.setBadgeCount(0);
  }
}

export const pushNotificationService = new PushNotificationService();
