import { FONTS } from '@/styles/global';
import { fs, hp, spacing, wp, borderRadius } from '@/utils/responsive';
import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { 
  ActivityIndicator, 
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
import { useInfiniteWatchlist, useRemoveFromWatchlist } from '@/hooks/queries/useVodQueries';
import { WatchlistItem } from '@/types/api.types';
import { useAuth } from '@/context/AuthContext';

export default function WatchlistScreen() {
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch watchlist with infinite scroll (only when authenticated)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteWatchlist(20, isAuthenticated);

  const removeFromWatchlist = useRemoveFromWatchlist();

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
    removeFromWatchlist.mutate(videoId);
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

  const renderItem = ({ item }: { item: WatchlistItem }) => (
    <Pressable 
      style={styles.itemContainer} 
      onPress={() => handleVideoPress(item.videoId)}
    >
      <Image
        source={
          item.video?.thumbnailUrl 
            ? { uri: item.video.thumbnailUrl } 
            : require('@/assets/images/Image-4.png')
        }
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.video?.title || 'Untitled Video'}
        </Text>
        <Text style={styles.itemChannel} numberOfLines={1}>
          {item.video?.channel?.name || 'Unknown Channel'}
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
          {isError ? 'Failed to load watchlist' : 'Your watchlist is empty'}
        </Text>
        <Text style={styles.emptySubtext}>
          Add videos to your watchlist to watch them later
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
          <Text style={styles.headerTitle}>Watchlist</Text>
          <View style={styles.headerSpacer} />
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
    width: wp(32),
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
  thumbnail: {
    width: wp(120),
    height: wp(68),
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
  },
  itemContent: {
    flex: 1,
    gap: hp(4),
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
