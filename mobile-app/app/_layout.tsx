import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '@/context/AppProvider';
import { PiPProvider } from '@/contexts/pip-context';
import { MiniPlayer } from '@/components/mini-player';
// Push notifications disabled until native modules are included in build
// import { pushNotificationService } from '@/services/push-notification.service';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Push notifications disabled until native modules are included in build
  // To enable: rebuild APK with expo-notifications native module
  // useEffect(() => {
  //   const initPushNotifications = async () => {
  //     const isAvailable = await pushNotificationService.initialize();
  //     if (isAvailable) {
  //       await pushNotificationService.registerForPushNotifications();
  //       setTimeout(() => {
  //         pushNotificationService.registerTokenWithBackend();
  //       }, 2000);
  //     }
  //   };
  //   initPushNotifications();
  //   return () => {
  //     pushNotificationService.removeListeners();
  //   };
  // }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProvider>
      <PiPProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: '#ffffff' }
              }}
            />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          {/* Floating Mini Player for PiP mode */}
          <MiniPlayer />
        </ThemeProvider>
      </PiPProvider>
    </AppProvider>
  );
}