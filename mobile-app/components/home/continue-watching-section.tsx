import { useContinueWatching } from '@/hooks/queries/useHomepageQueries';
import { FONTS } from '@/styles/global';
import { borderRadius, dimensions, fs, hp, spacing, wp } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { ImageSourcePropType, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Skeleton } from '../skeleton';
import { VideoCard } from './video-card';

export function ContinueWatchingSection() {
  const router = useRouter();
  const { data: continueWatchingData, isLoading, error } = useContinueWatching();

  const handleCardPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton width={wp(180)} height={dimensions.isTablet ? fs(28) : fs(20)} borderRadius={borderRadius.xs} style={{ marginBottom: spacing.sm }} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <Skeleton width={wp(160)} height={dimensions.isTablet ? hp(120) : hp(90)} borderRadius={borderRadius.sm} />
              <Skeleton width={wp(140)} height={dimensions.isTablet ? fs(18) : fs(14)} borderRadius={borderRadius.xs} style={{ marginTop: spacing.sm }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Don't show section if no data or error
  if (error || !continueWatchingData || continueWatchingData.length === 0) {
    return null;
  }

  const displayData = continueWatchingData.map((item) => ({
    imageSource: item.video?.thumbnailUrl 
      ? { uri: item.video.thumbnailUrl } as ImageSourcePropType
      : require('@/assets/images/carusel-2.png') as ImageSourcePropType,
    title: item.video?.title || 'Untitled',
    progress: item.durationSeconds > 0 
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100) 
      : 0,
    videoId: item.video?.id,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue Watching</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {displayData.map((item, index) => (
          <VideoCard
            key={item.videoId || index}
            imageSource={item.imageSource}
            title={item.title}
            showBadge={false}
            onPress={() => item.videoId && handleCardPress(item.videoId)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: dimensions.isTablet ? fs(24) : fs(20),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginBottom: spacing.sm,
  },
  scrollView: {
    marginLeft: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
  skeletonCard: {
    width: wp(160),
    marginRight: spacing.md,
  },
  noDataText: {
    fontSize: dimensions.isTablet ? fs(16) : fs(14),
    fontFamily: FONTS.regular,
    color: '#666666',
    marginBottom: spacing.sm,
  },
});
