import { NotificationItem } from '@/components/notifications/notification-item';
import { NotificationsHeader } from '@/components/notifications/notifications-header';
import { styles } from '@/styles/notifications.styles';
import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  Modal,
  Pressable, 
  RefreshControl, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity,
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
import { hp, spacing, wp, fs } from '@/utils/responsive';
import { FONTS } from '@/styles/global';

type TabType = 'All' | 'Comments' | 'Reminders';

// Map notification types to tabs
const COMMENT_TYPES: NotificationType[] = ['comment_reply', 'video_like'];
const REMINDER_TYPES: NotificationType[] = ['program_reminder', 'new_livestream'];

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

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

    // Navigate based on notification data
    if (notification.videoId) {
      router.push(`/video?id=${notification.videoId}`);
    } else if (notification.livestreamId) {
      router.push(`/live-video?id=${notification.livestreamId}`);
    } else if (notification.channelId) {
      router.push(`/channel-profile?id=${notification.channelId}`);
    } else if (notification.programId) {
      router.push(`/program-profile?id=${notification.programId}`);
    }
    // If no navigation data, just mark as read (already done above)
  };

  const handleNotificationMenuPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setMenuVisible(true);
  };

  const handleMarkAsRead = () => {
    if (selectedNotification && !selectedNotification.isRead) {
      markAsRead.mutate(selectedNotification.id);
    }
    setMenuVisible(false);
    setSelectedNotification(null);
  };

  const handleDeleteNotification = () => {
    if (selectedNotification) {
      deleteNotification.mutate(selectedNotification.id);
    }
    setMenuVisible(false);
    setSelectedNotification(null);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedNotification(null);
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

        {/* Notification Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable style={localStyles.modalOverlay} onPress={closeMenu}>
            <View style={localStyles.menuContainer}>
              {selectedNotification && !selectedNotification.isRead && (
                <TouchableOpacity 
                  style={localStyles.menuItem} 
                  onPress={handleMarkAsRead}
                >
                  <Text style={localStyles.menuItemText}>Mark as read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[localStyles.menuItem, localStyles.menuItemDestructive]} 
                onPress={handleDeleteNotification}
              >
                <Text style={[localStyles.menuItemText, localStyles.menuItemTextDestructive]}>
                  Delete notification
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[localStyles.menuItem, localStyles.menuItemCancel]} 
                onPress={closeMenu}
              >
                <Text style={localStyles.menuItemTextCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: hp(34),
    paddingTop: hp(8),
  },
  menuItem: {
    paddingVertical: hp(16),
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemDestructive: {
    borderBottomWidth: 0,
  },
  menuItemCancel: {
    marginTop: hp(8),
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: fs(16),
    fontFamily: FONTS.medium,
    color: '#000000',
    textAlign: 'center',
  },
  menuItemTextDestructive: {
    color: '#EF4444',
  },
  menuItemTextCancel: {
    fontSize: fs(16),
    fontFamily: FONTS.medium,
    color: '#737373',
    textAlign: 'center',
  },
});
