import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth.service';

/**
 * KingsChat OAuth callback handler
 * This route catches the redirect from KingsChat OAuth
 */
export default function KingsChatCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    expires_in_millis?: string;
    error?: string;
  }>();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('KingsChat callback params:', params);

      if (params.error) {
        console.error('KingsChat error:', params.error);
        router.replace('/(auth)');
        return;
      }

      const accessToken = params.access_token;
      
      if (!accessToken) {
        console.error('No access token in callback');
        router.replace('/(auth)');
        return;
      }

      try {
        // Send the KingsChat token to our backend
        const response = await authService.loginWithKingsChatToken(accessToken, params.refresh_token);

        if (response.success) {
          await storage.saveTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
          await storage.saveUserData(response.data.user);
          
          console.log('KingsChat login successful!');
          router.replace('/(tabs)');
        } else {
          console.error('Backend login failed');
          router.replace('/(auth)');
        }
      } catch (error) {
        console.error('Error processing KingsChat callback:', error);
        router.replace('/(auth)');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={{ color: '#fff', marginTop: 16 }}>Processing login...</Text>
    </View>
  );
}
