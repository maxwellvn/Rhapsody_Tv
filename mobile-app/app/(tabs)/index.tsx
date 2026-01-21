import { BottomNav } from '@/components/bottom-nav';
import { ChannelsListSection } from '@/components/home/channels-list-section';
import { ContinueWatchingSection } from '@/components/home/continue-watching-section';
import { FeaturedVideosSection } from '@/components/home/featured-videos-section';
import { LiveNowSection } from '@/components/home/live-now-section';
import { LivestreamsSection } from '@/components/home/livestreams-section';
import { ProgramHighlightsSection } from '@/components/home/program-highlights-section';
import { ProgramsSection } from '@/components/home/programs-section';
import { SearchBar } from '@/components/search-bar';
import { homepageKeys } from '@/hooks/queries/useHomepageQueries';
import { useNotifications } from '@/contexts/notification-context';
import { styles } from '@/styles/home.styles';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { wp, fs } from '@/utils/responsive';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get unread notification count from context (real-time updates via WebSocket)
  const { unreadCount } = useNotifications();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalidate all homepage queries to trigger refetch
    await queryClient.invalidateQueries({ queryKey: homepageKeys.all });
    setRefreshing(false);
  }, [queryClient]);

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleSearchFocus = () => {
    router.push('/search');
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'Discover') {
      router.push('/(tabs)/discover');
    } else if (tab === 'Schedule') {
      router.push('/(tabs)/schedule');
    } else if (tab === 'Profile') {
      router.push('/(tabs)/profile');
    } else if (tab === 'Home') {
      // Already on home
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/logo/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable onPress={handleNotificationPress} style={styles.notificationButton}>
          <Image
            source={require('@/assets/Icons/Bell.png')}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
          {unreadCount > 0 && (
            <View style={localStyles.badge}>
              <Text style={localStyles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search Bar - tapping navigates to search screen */}
      <Pressable style={styles.searchContainer} onPress={handleSearchFocus}>
        <View pointerEvents="none">
          <SearchBar 
            placeholder="Search channels and programs..."
          />
        </View>
      </Pressable>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
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
        <LiveNowSection />
        <LivestreamsSection />
        <ContinueWatchingSection />
        <ChannelsListSection />
        <ProgramsSection />
        <FeaturedVideosSection />
        <ProgramHighlightsSection />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Home" onTabPress={handleTabPress} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: wp(10),
    minWidth: wp(18),
    height: wp(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fs(10),
    fontWeight: '700',
  },
});
