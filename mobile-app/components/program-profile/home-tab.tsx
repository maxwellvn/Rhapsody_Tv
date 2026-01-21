import { HorizontalVideoCard } from '@/components/program-profile/horizontal-video-card';
import { VideoRecommendationCard } from '@/components/video-recommendation-card';
import { FONTS } from '@/styles/global';
import { fs, hp } from '@/utils/responsive';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useProgramVideos } from '@/hooks/queries/useProgramQueries';
import { router } from 'expo-router';

type HomeTabProps = {
  programId: string;
  programName?: string;
  channelName?: string;
};

export function HomeTab({ programId, programName, channelName }: HomeTabProps) {
  const { data: videosData, isLoading, error } = useProgramVideos(programId, 1, 10);

  const handleVideoPress = (videoId: string) => {
    router.push({
      pathname: '/video',
      params: { id: videoId },
    });
  };

  const handleMenuPress = (videoId: string) => {
    console.log('Menu pressed for video:', videoId);
    // Menu logic will go here
  };

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k views`;
    return `${count} views`;
  };

  // Format duration
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string | undefined): string => {
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
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error || !videosData?.videos?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos available for this program yet.</Text>
      </View>
    );
  }

  const videos = videosData.videos;
  const featuredVideo = videos[0];
  const latestVideos = videos.slice(1);

  return (
    <View style={styles.container}>
      {/* Featured Video */}
      {featuredVideo && (
        <VideoRecommendationCard
          thumbnailSource={featuredVideo.thumbnailUrl ? { uri: featuredVideo.thumbnailUrl } : require('@/assets/images/Image-11.png')}
          title={featuredVideo.title}
          channelAvatar={featuredVideo.channel?.logoUrl ? { uri: featuredVideo.channel.logoUrl } : require('@/assets/images/Avatar.png')}
          channelName={featuredVideo.channel?.name || channelName || programName || 'Unknown'}
          viewCount={formatViewCount(featuredVideo.viewCount)}
          timeAgo={formatTimeAgo(featuredVideo.publishedAt || featuredVideo.createdAt)}
          onPress={() => handleVideoPress(featuredVideo.id)}
          onMenuPress={() => handleMenuPress(featuredVideo.id)}
        />
      )}

      {/* Latest Videos Section */}
      {latestVideos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Latest Videos</Text>
          {latestVideos.map((video) => (
            <HorizontalVideoCard
              key={video.id}
              thumbnailSource={video.thumbnailUrl ? { uri: video.thumbnailUrl } : require('@/assets/images/Image-11.png')}
              duration={formatDuration(video.durationSeconds)}
              title={video.title}
              channelName={video.channel?.name || channelName || programName || 'Unknown'}
              viewCount={formatViewCount(video.viewCount)}
              timeAgo={formatTimeAgo(video.publishedAt || video.createdAt)}
              onPress={() => handleVideoPress(video.id)}
              onMenuPress={() => handleMenuPress(video.id)}
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
    paddingVertical: hp(40),
  },
  loadingText: {
    marginTop: hp(12),
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(40),
  },
  emptyText: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#666666',
    textAlign: 'center',
  },
});
