import { FONTS } from '@/styles/global';
import { fs, hp, spacing, wp, borderRadius } from '@/utils/responsive';
import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert,
  FlatList, 
  Image, 
  Pressable, 
  RefreshControl, 
  StatusBar, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  useInfiniteWatchHistory, 
  useRemoveFromHistory,
  useClearWatchHistory,
} from '@/hooks/queries/useVodQueries';
import { WatchHistoryItem } from '@/types/api.types';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch watch history with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteWatchHistory(20);

  const removeFromHistory = useRemoveFromHistory();
  const clearHistory = useClearWatchHistory();

  // Flatten paginated data
  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items || []);
  }, [data]);

  const handleBack = () => {
    router.back();
  };

  const handleVideoPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  const handleRemove = (videoId: string) => {
    removeFromHistory.mutate(videoId);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear Watch History',
      'Are you sure you want to clear your entire watch history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearHistory.mutate(),
        },
      ]
    );
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

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Format progress percentage
  const getProgressPercent = (watched: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((watched / total) * 100));
  };

  const renderItem = ({ item }: { item: WatchHistoryItem }) => {
    const progress = getProgressPercent(item.watchedSeconds, item.totalDurationSeconds);
    
    return (
      <Pressable 
        style={styles.itemContainer} 
        onPress={() => handleVideoPress(item.videoId)}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={
              item.video?.thumbnailUrl 
                ? { uri: item.video.thumbnailUrl } 
                : require('@/assets/images/Image-4.png')
            }
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {/* Progress bar */}
          {progress > 0 && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
          {item.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Watched</Text>
            </View>
          )}
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.video?.title || 'Untitled Video'}
          </Text>
          <Text style={styles.itemChannel} numberOfLines={1}>
            {item.video?.channel?.name || 'Unknown Channel'}
          </Text>
          <Text style={styles.itemTime}>
            {getTimeAgo(item.lastWatchedAt)}
          </Text>
        </View>
        <Pressable 
          style={styles.removeButton} 
          onPress={() => handleRemove(item.videoId)}
          hitSlop={8}
        >
          <Ionicons name="close" size={wp(20)} color="#737373" />
        </Pressable>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isError ? 'Failed to load history' : 'No watch history yet'}
        </Text>
        <Text style={styles.emptySubtext}>
          Videos you watch will appear here
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
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
            <Image
              source={require('@/assets/Icons/back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.headerTitle}>Watch History</Text>
          {allItems.length > 0 && (
            <Pressable onPress={handleClearAll} style={styles.clearButton} hitSlop={8}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          )}
          {allItems.length === 0 && <View style={styles.headerSpacer} />}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={allItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: hp(10),
    paddingBottom: hp(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    width: wp(60),
  },
  clearButton: {
    paddingVertical: hp(6),
    paddingHorizontal: wp(12),
  },
  clearButtonText: {
    fontSize: fs(14),
    fontFamily: FONTS.medium,
    color: '#2563EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: hp(8),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: hp(12),
    gap: wp(12),
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: wp(120),
    height: wp(68),
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(3),
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  completedBadge: {
    position: 'absolute',
    top: hp(4),
    right: wp(4),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    borderRadius: borderRadius.sm,
  },
  completedText: {
    fontSize: fs(10),
    fontFamily: FONTS.medium,
    color: '#FFFFFF',
  },
  itemContent: {
    flex: 1,
    gap: hp(2),
  },
  itemTitle: {
    fontSize: fs(15),
    fontFamily: FONTS.medium,
    color: '#000000',
  },
  itemChannel: {
    fontSize: fs(13),
    fontFamily: FONTS.regular,
    color: '#737373',
  },
  itemTime: {
    fontSize: fs(12),
    fontFamily: FONTS.regular,
    color: '#999999',
  },
  removeButton: {
    padding: wp(8),
  },
  footer: {
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(100),
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fs(18),
    fontFamily: FONTS.medium,
    color: '#000000',
    textAlign: 'center',
    marginBottom: hp(8),
  },
  emptySubtext: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#737373',
    textAlign: 'center',
  },
});
