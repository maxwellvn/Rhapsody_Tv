import { VideoRecommendationCard } from '@/components/channel-profile/video-recommendation-card';
import { HorizontalVideoCard } from '@/components/program-profile/horizontal-video-card';
import { FONTS } from '@/styles/global';
import { fs, hp } from '@/utils/responsive';
import { ActivityIndicator, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { useVodVideos } from '@/hooks/queries/useVodQueries';
import { router } from 'expo-router';

interface HomeTabProps {
  channelId: string;
  channelName: string;
}

export function HomeTab({ channelId, channelName }: HomeTabProps) {
  // Note: Backend doesn't have channel-specific videos endpoint
  // Using VOD list and will filter by channelId if available
  const { data: videosData, isLoading, error } = useVodVideos(1, 10);

  const handleVideoPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  const handleMenuPress = (title: string) => {
    console.log('Menu pressed for:', title);
  };

  // Format view count
  const formatViews = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k views`;
    return `${count} views`;
  };

  // Format duration from seconds
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return '';
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !videosData || videosData.videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos available</Text>
      </View>
    );
  }

  // Filter videos by channelId if available, otherwise show all
  const allVideos = videosData.videos;
  const channelVideos = allVideos.filter(v => v.channelId === channelId);
  const videos = channelVideos.length > 0 ? channelVideos : allVideos;
  const featuredVideo = videos[0];
  const latestVideos = videos.slice(1);

  return (
    <View style={styles.container}>
      {/* Featured Video */}
      {featuredVideo && (
        <VideoRecommendationCard
          thumbnailSource={
            featuredVideo.thumbnailUrl
              ? { uri: featuredVideo.thumbnailUrl } as ImageSourcePropType
              : require('@/assets/images/Image-12.png') as ImageSourcePropType
          }
          title={featuredVideo.title}
          channelAvatar={require('@/assets/images/Avatar.png')}
          channelName={channelName}
          viewCount={formatViews(featuredVideo.viewCount)}
          timeAgo={formatTimeAgo(featuredVideo.publishedAt || featuredVideo.createdAt)}
          isLive={false}
          duration={formatDuration(featuredVideo.durationSeconds)}
          onPress={() => handleVideoPress(featuredVideo.id)}
          onMenuPress={() => handleMenuPress(featuredVideo.title)}
        />
      )}

      {/* Latest Videos Section */}
      {latestVideos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Latest Videos</Text>
          {latestVideos.map((video) => (
            <HorizontalVideoCard
              key={video.id}
              thumbnailSource={
                video.thumbnailUrl
                  ? { uri: video.thumbnailUrl } as ImageSourcePropType
                  : require('@/assets/images/Image-11.png') as ImageSourcePropType
              }
              duration={formatDuration(video.durationSeconds)}
              title={video.title}
              channelName={channelName}
              viewCount={formatViews(video.viewCount)}
              timeAgo={formatTimeAgo(video.publishedAt || video.createdAt)}
              onPress={() => handleVideoPress(video.id)}
              onMenuPress={() => handleMenuPress(video.title)}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fs(20),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginTop: hp(10),
    marginBottom: hp(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#666666',
  },
});
