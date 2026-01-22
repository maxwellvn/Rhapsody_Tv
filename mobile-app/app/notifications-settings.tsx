import { SettingsItemToggle } from '@/components/settings/settings-item-toggle';
import { SettingsSection } from '@/components/settings/settings-section';
import { FONTS } from '@/styles/global';
import { fs, hp, spacing, wp } from '@/utils/responsive';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api.client';
import { useAuth } from '@/context/AuthContext';

interface NotificationPreferences {
  subscriptions: boolean;
  recommendedVideos: boolean;
  commentActivity: boolean;
  newChannels: boolean;
  livestreams: boolean;
}

export default function NotificationsSettingsScreen() {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    subscriptions: true,
    recommendedVideos: true,
    commentActivity: true,
    newChannels: true,
    livestreams: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  // Fetch preferences on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      if (response.data?.data) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!isAuthenticated) return;
    
    setUpdating(key);
    
    // Optimistically update UI
    setPreferences(prev => ({ ...prev, [key]: value }));

    try {
      await api.patch('/notifications/preferences', { [key]: value });
    } catch (error) {
      console.error('Error updating notification preference:', error);
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !value }));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
            <Image
              source={require('@/assets/Icons/back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <SettingsSection>
              <SettingsItemToggle
                label="Subscriptions"
                description="Get notified about new videos and livestreams from your subscribed channels."
                value={preferences.subscriptions}
                onValueChange={(value) => updatePreference('subscriptions', value)}
                disabled={updating === 'subscriptions'}
              />
              <SettingsItemToggle
                label="Recommended Videos"
                description="Get notified about videos recommended for you based on your viewing history."
                value={preferences.recommendedVideos}
                onValueChange={(value) => updatePreference('recommendedVideos', value)}
                disabled={updating === 'recommendedVideos'}
              />
              <SettingsItemToggle
                label="Livestreams"
                description="Get notified when channels you follow go live."
                value={preferences.livestreams}
                onValueChange={(value) => updatePreference('livestreams', value)}
                disabled={updating === 'livestreams'}
              />
              <SettingsItemToggle
                label="New Channels"
                description="Get notified about new channels available on the platform."
                value={preferences.newChannels}
                onValueChange={(value) => updatePreference('newChannels', value)}
                disabled={updating === 'newChannels'}
              />
              <SettingsItemToggle
                label="Comment Activity"
                description="Get notified about replies, likes, and other activity on your comments."
                value={preferences.commentActivity}
                onValueChange={(value) => updatePreference('commentActivity', value)}
                disabled={updating === 'commentActivity'}
              />
            </SettingsSection>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: hp(10),
    paddingBottom: hp(12),
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: wp(4),
  },
  backIcon: {
    width: wp(24),
    height: hp(24),
    tintColor: '#000000',
  },
  headerTitle: {
    flex: 1,
    fontSize: fs(20),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginLeft: spacing.md,
  },
  headerSpacer: {
    width: wp(32),
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: hp(20),
  },
});
