import { FONTS } from '@/styles/global';
import { useFeaturedVideos } from '@/hooks/queries/useHomepageQueries';
import { useRouter } from 'expo-router';
import { ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VideoCard } from './video-card';
import { FeaturedVideosSkeleton } from '../skeleton';
import { dimensions, fs, spacing } from '@/utils/responsive';

export function FeaturedVideosSection() {
  const router = useRouter();
  const { data: featuredVideos, isLoading, error } = useFeaturedVideos(10);

  const handleCardPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  const handleSeeAllPress = () => {
    router.push('/(tabs)/discover');
  };

  if (isLoading) {
    return <FeaturedVideosSkeleton />;
  }

  if (error || !featuredVideos || featuredVideos.length === 0) {
    return null; // Don't show section if no data
  }

  const displayData = featuredVideos.map((v) => ({
    id: v.id,
    title: v.title,
    thumbnail: (v.thumbnailUrl
      ? ({ uri: v.thumbnailUrl } as ImageSourcePropType)
      : (require('@/assets/images/carusel-2.png') as ImageSourcePropType)),
    badgeLabel: 'Featured',
    badgeColor: '#2563EB',
  }));

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Featured Videos</Text>
        <Pressable onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      {/* Videos Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {displayData.map((item) => (
          <VideoCard
            key={item.id}
            imageSource={item.thumbnail}
            title={item.title}
            badgeLabel={item.badgeLabel}
            badgeColor={item.badgeColor}
            showBadge={true}
            onPress={() => handleCardPress(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: dimensions.isTablet ? fs(24) : fs(20),
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  seeAllText: {
    fontSize: dimensions.isTablet ? fs(16) : fs(14),
    fontFamily: FONTS.medium,
    color: '#666666',
  },
  scrollView: {
    marginLeft: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
  noDataText: {
    fontSize: dimensions.isTablet ? fs(16) : fs(14),
    fontFamily: FONTS.regular,
    color: '#666666',
    marginBottom: spacing.sm,
  },
});
