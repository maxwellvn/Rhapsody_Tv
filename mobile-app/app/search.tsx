import { FONTS } from '@/styles/global';
import { fs, hp, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';

interface SearchResult {
  id: string;
  type: 'video' | 'channel' | 'program' | 'livestream';
  title: string;
  thumbnailUrl?: string;
  channelName?: string;
  viewCount?: number;
}

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Search videos
  const { data: videosData, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['search', 'videos', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return { videos: [] };
      const response = await api.get(API_ENDPOINTS.VOD.LIST, {
        params: { limit: 10 },
      });
      // Filter videos by title (client-side for now)
      const filtered = (response.data?.videos || []).filter((v: any) =>
        v.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      return { videos: filtered };
    },
    enabled: debouncedSearch.length > 0,
  });

  // Search channels
  const { data: channelsData, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['search', 'channels', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return { channels: [] };
      const response = await api.get(API_ENDPOINTS.CHANNELS.LIST, {
        params: { limit: 10 },
      });
      // Filter channels by name (client-side for now)
      const filtered = (response.data?.channels || []).filter((c: any) =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      return { channels: filtered };
    },
    enabled: debouncedSearch.length > 0,
  });

  const isLoading = isLoadingVideos || isLoadingChannels;

  // Combine results
  const results: SearchResult[] = [
    ...(channelsData?.channels || []).map((c: any) => ({
      id: c._id || c.id,
      type: 'channel' as const,
      title: c.name,
      thumbnailUrl: c.logoUrl,
    })),
    ...(videosData?.videos || []).map((v: any) => ({
      id: v.id || v._id,
      type: 'video' as const,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      channelName: v.channel?.name,
      viewCount: v.viewCount,
    })),
  ];

  const handleBack = () => {
    router.back();
  };

  const handleClear = () => {
    setSearchText('');
  };

  const handleResultPress = (item: SearchResult) => {
    if (item.type === 'channel') {
      router.push(`/channel-profile?id=${item.id}`);
    } else if (item.type === 'video') {
      router.push(`/video?id=${item.id}`);
    } else if (item.type === 'livestream') {
      router.push(`/live-video?id=${item.id}`);
    }
  };

  const formatViews = (count?: number): string => {
    if (!count) return '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k views`;
    return `${count} views`;
  };

  const renderItem = useCallback(({ item }: { item: SearchResult }) => (
    <Pressable style={styles.resultItem} onPress={() => handleResultPress(item)}>
      <Image
        source={
          item.thumbnailUrl
            ? { uri: item.thumbnailUrl } as ImageSourcePropType
            : require('@/assets/images/Avatar.png') as ImageSourcePropType
        }
        style={item.type === 'channel' ? styles.channelAvatar : styles.videoThumbnail}
        resizeMode="cover"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        {item.type === 'channel' && (
          <Text style={styles.resultSubtitle}>Channel</Text>
        )}
        {item.type === 'video' && (
          <Text style={styles.resultSubtitle}>
            {item.channelName}{item.viewCount ? ` - ${formatViews(item.viewCount)}` : ''}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </Pressable>
  ), []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Search Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search channels and videos..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable onPress={handleClear} style={styles.clearButton} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results */}
        {isLoading && debouncedSearch.length > 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : debouncedSearch.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Search for channels and videos</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No results found for "{debouncedSearch}"</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: wp(12),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: wp(12),
    height: hp(44),
  },
  searchIcon: {
    marginRight: wp(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#000',
  },
  clearButton: {
    marginLeft: wp(8),
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
    paddingVertical: hp(8),
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
  },
  channelAvatar: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    backgroundColor: '#F0F0F0',
  },
  videoThumbnail: {
    width: wp(80),
    height: wp(45),
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  resultInfo: {
    flex: 1,
    marginLeft: wp(12),
  },
  resultTitle: {
    fontSize: fs(15),
    fontFamily: FONTS.medium,
    color: '#000',
  },
  resultSubtitle: {
    fontSize: fs(13),
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: hp(2),
  },
});
