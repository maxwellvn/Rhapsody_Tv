import { FONTS } from '@/styles/global';
import { fs, hp, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  viewCount: number;
  durationSeconds?: number;
  createdAt: string;
  channel?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export default function LatestVideosScreen() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['latest-videos'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(API_ENDPOINTS.VOD.LATEST, {
        params: { page: pageParam, limit: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const videos = data?.pages.flatMap((page) => page.videos) || [];

  const handleBack = () => {
    router.back();
  };

  const handleVideoPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  const formatViews = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k views`;
    return `${count} views`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderVideo = useCallback(({ item }: { item: Video }) => (
    <Pressable style={styles.videoCard} onPress={() => handleVideoPress(item.id)}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={
            item.thumbnailUrl
              ? { uri: item.thumbnailUrl } as ImageSourcePropType
              : require('@/assets/images/Image-11.png') as ImageSourcePropType
          }
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.durationSeconds && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(item.durationSeconds)}</Text>
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        <Image
          source={
            item.channel?.logoUrl
              ? { uri: item.channel.logoUrl } as ImageSourcePropType
              : require('@/assets/images/Avatar.png') as ImageSourcePropType
          }
          style={styles.channelAvatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.channelName}>{item.channel?.name || 'Unknown Channel'}</Text>
          <Text style={styles.viewsTime}>
            {formatViews(item.viewCount)} - {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  ), []);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Latest Videos</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={renderVideo}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
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
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: wp(40),
  },
  headerTitle: {
    fontSize: fs(18),
    fontFamily: FONTS.semibold,
    color: '#000',
  },
  headerRight: {
    width: wp(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(40),
  },
  emptyText: {
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: hp(16),
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: hp(16),
  },
  videoCard: {
    marginHorizontal: wp(16),
    marginBottom: hp(20),
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: fs(12),
    fontFamily: FONTS.medium,
  },
  videoInfo: {
    flexDirection: 'row',
    marginTop: hp(12),
  },
  channelAvatar: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: '#F0F0F0',
  },
  textContainer: {
    flex: 1,
    marginLeft: wp(12),
  },
  videoTitle: {
    fontSize: fs(15),
    fontFamily: FONTS.medium,
    color: '#000',
    lineHeight: fs(20),
  },
  channelName: {
    fontSize: fs(13),
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: hp(2),
  },
  viewsTime: {
    fontSize: fs(12),
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: hp(2),
  },
  footerLoader: {
    paddingVertical: hp(20),
    alignItems: 'center',
  },
});
