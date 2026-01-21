import { hp, wp } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { storage } from '@/utils/storage';

// Keep the native splash screen visible while we load
SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Hide native splash screen immediately when this component mounts
    SplashScreen.hideAsync();

    const checkAuthAndNavigate = async () => {
      try {
        // Check if user is already logged in
        const [token, userData, onboardingCompleted] = await Promise.all([
          storage.getAccessToken(),
          storage.getUserData(),
          storage.isOnboardingCompleted(),
        ]);

        // Wait a bit to show splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (token && userData) {
          // User is logged in, go directly to home
          router.replace('/(tabs)');
        } else if (onboardingCompleted) {
          // Onboarding done but not logged in, go to signin
          router.replace('/(auth)/signin');
        } else {
          // First time user, show onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // On error, default to onboarding
        router.replace('/onboarding');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndNavigate();
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      
      <Image
        source={require('@/assets/logo/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: wp(261),
    height: hp(56),
    maxWidth: 261,
    maxHeight: 56,
  },
});
