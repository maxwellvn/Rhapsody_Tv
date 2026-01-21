import { NotificationItem } from '@/components/notifications/notification-item';
import { NotificationsHeader } from '@/components/notifications/notifications-header';
import { styles } from '@/styles/notifications.styles';
import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  Pressable, 
  RefreshControl, 
  StatusBar, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useInfiniteNotifications, 
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/hooks/queries/useNotificationQueries';
import { Notification, NotificationType } from '@/types/api.types';
import { formatDistanceToNow } from 'date-fns';
import { hp, spacing } from '@/utils/responsive';

type TabType = 'All' | 'Comments' | 'Reminders';

// Map notification types to tabs
const COMMENT_TYPES: NotificationType[] = ['comment_reply', 'video_like'];
const REMINDER_TYPES: NotificationType[] = ['program_reminder', 'new_livestream'];

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteNotifications(20);

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  // Flatten paginated data into a single list
  const allNotifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.notifications || []);
  }, [data]);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return allNotifications;
    if (activeTab === 'Comments') {
      return allNotifications.filter(n => COMMENT_TYPES.includes(n.type));
    }
    if (activeTab === 'Reminders') {
      return allNotifications.filter(n => REMINDER_TYPES.includes(n.type));
    }
    return allNotifications;
  }, [allNotifications, activeTab]);

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    console.log('Search pressed');
  };

  const handleMenu = () => {
    // Mark all as read
    markAllAsRead.mutate();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type and available IDs
    if (notification.videoId) {
      router.push(`/video?id=${notification.videoId}`);
    } else if (notification.channelId) {
      router.push(`/channel-profile?id=${notification.channelId}`);
    } else if (notification.programId) {
      router.push(`/program-profile?id=${notification.programId}`);
    } else if (notification.livestreamId) {
      // Navigate to live video screen for livestreams
      router.push(`/live-video?id=${notification.livestreamId}`);
    }
  };

  const handleNotificationMenuPress = (notification: Notification) => {
    // Delete the notification
    deleteNotification.mutate(notification.id);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Format relative time
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      avatar={item.thumbnail}
      title={item.title}
      subtitle={item.message}
      timeAgo={getTimeAgo(item.createdAt)}
      thumbnail={item.thumbnail}
      isRead={item.isRead}
      onPress={() => handleNotificationPress(item)}
      onMenuPress={() => handleNotificationMenuPress(item)}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={localStyles.footer}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={localStyles.emptyContainer}>
        <Text style={localStyles.emptyText}>
          {isError ? 'Failed to load notifications' : 'No notifications yet'}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <NotificationsHeader
          title="Notifications"
          onBackPress={handleBack}
          onSearchPress={handleSearch}
          onMenuPress={handleMenu}
        />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'All' && styles.activeTab]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
              All
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'Comments' && styles.activeTab]}
            onPress={() => setActiveTab('Comments')}
          >
            <Text style={[styles.tabText, activeTab === 'Comments' && styles.activeTabText]}>
              Comments
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'Reminders' && styles.activeTab]}
            onPress={() => setActiveTab('Reminders')}
          >
            <Text style={[styles.tabText, activeTab === 'Reminders' && styles.activeTabText]}>
              Reminders
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) => item.id || `notification-${index}`}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2563EB"
                colors={['#2563EB']}
              />
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(60),
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: '#737373',
    textAlign: 'center',
  },
});
