import { BottomNav } from '@/components/bottom-nav';
import { DownloadedVideosItem } from '@/components/profile/downloaded-videos-item';
import { ProfileInfo } from '@/components/profile/profile-info';
import { ProfileSection } from '@/components/profile/profile-section';
import { hp, platformValue, spacing, wp } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { userService } from '@/services/user.service';
import { storage } from '@/utils/storage';
import { useQueryClient } from '@tanstack/react-query';
import { useWatchHistory, useWatchlist, vodKeys } from '@/hooks/queries/useVodQueries';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  fullName: string;
  email?: string;
  avatar?: string;
  username?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch watch history from VOD API (only when authenticated)
  const { data: historyData } = useWatchHistory(1, 10, isAuthenticated);
  
  // Fetch watchlist from VOD API (only when authenticated)
  const { data: watchlistData } = useWatchlist(1, 10, isAuthenticated);

  // Transform history data for ProfileSection
  const historyItems = useMemo(() => {
    if (!historyData?.items) return [];
    return historyData.items.slice(0, 5).map((item) => ({
      imageSource: item.video?.thumbnailUrl 
        ? { uri: item.video.thumbnailUrl } as ImageSourcePropType
        : require('@/assets/images/Image-4.png') as ImageSourcePropType,
      title: item.video?.title || 'Untitled',
      badgeLabel: undefined,
      badgeColor: undefined,
      showBadge: false,
      onPress: () => item.videoId && router.push(`/video?id=${item.videoId}`),
    }));
  }, [historyData, router]);

  // Transform watchlist data for ProfileSection
  const watchlistItems = useMemo(() => {
    if (!watchlistData?.items) return [];
    return watchlistData.items.slice(0, 5).map((item) => ({
      imageSource: item.video?.thumbnailUrl 
        ? { uri: item.video.thumbnailUrl } as ImageSourcePropType
        : require('@/assets/images/Image-4.png') as ImageSourcePropType,
      title: item.video?.title || 'Untitled',
      badgeLabel: undefined,
      badgeColor: undefined,
      showBadge: false,
      onPress: () => item.videoId && router.push(`/video?id=${item.videoId}`),
    }));
  }, [watchlistData, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refresh profile data, history, and watchlist
    await Promise.all([
      loadProfile(),
      queryClient.invalidateQueries({ queryKey: vodKeys.history() }),
      queryClient.invalidateQueries({ queryKey: vodKeys.watchlist() }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // First, try to load from storage (faster, shows cached data)
      const cachedUser = await storage.getUserData<UserProfile>();
      if (cachedUser) {
        setUserProfile(cachedUser);
      }

      // Then fetch fresh data from API
      const response = await userService.getProfile();
      if (response.success && response.data) {
        setUserProfile(response.data as UserProfile);
        // Update cached data
        await storage.saveUserData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If API fails, we'll show cached data if available
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleDownloadedVideos = () => {
    console.log('Downloaded videos pressed');
    // Downloaded videos navigation will go here
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'Home') {
      router.push('/(tabs)');
    } else if (tab === 'Discover') {
      router.push('/(tabs)/discover');
    } else if (tab === 'Schedule') {
      router.push('/(tabs)/schedule');
    } else if (tab === 'Profile') {
      // Already on profile
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        
        <View style={styles.headerRight}>
          <Pressable onPress={handleNotificationPress} hitSlop={8}>
            <Image
              source={require('@/assets/Icons/bells.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable onPress={handleSettingsPress} hitSlop={8}>
            <Image
              source={require('@/assets/Icons/settings.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <ProfileInfo
            avatarSource={userProfile?.avatar ? { uri: userProfile.avatar } : require('@/assets/images/Avatar.png')}
            name={userProfile?.fullName || 'Guest User'}
            email={userProfile?.email || ''}
            onEditPress={handleEditProfile}
          />
        )}

        {/* History Section */}
        {historyItems.length > 0 && (
          <ProfileSection
            title="History"
            onSeeAllPress={() => router.push('/history')}
            items={historyItems}
          />
        )}

        {/* Watchlist Section */}
        {watchlistItems.length > 0 && (
          <ProfileSection
            title="Watchlist"
            onSeeAllPress={() => router.push('/watchlist')}
            items={watchlistItems}
          />
        )}

        {/* Downloaded Videos */}
        <DownloadedVideosItem onPress={handleDownloadedVideos} />
      </ScrollView>

      <BottomNav activeTab="Profile" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: platformValue(hp(50), hp(46)),
    paddingBottom: hp(12),
  },
  headerSpacer: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  headerIcon: {
    width: wp(20),
    height: hp(20),
    tintColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: hp(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
