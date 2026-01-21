import { FONTS } from '@/styles/global';
import { useProgramHighlights } from '@/hooks/queries/useHomepageQueries';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, ImageSourcePropType } from 'react-native';
import { VideoCard } from './video-card';
import { fs, spacing, dimensions } from '@/utils/responsive';
import { ProgramHighlightsSkeleton } from '../skeleton';

export function ProgramHighlightsSection() {
  const { data: highlightsData, isLoading, error } = useProgramHighlights(10);

  const handleCardPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  const handleSeeAllPress = () => {
    router.push('/latest-videos');
  };

  if (isLoading) {
    return <ProgramHighlightsSkeleton />;
  }

  if (error || !highlightsData || highlightsData.length === 0) {
    return null; // Don't show section if no data
  }

  const displayData = highlightsData.map((highlight) => ({
    id: highlight.id,
    videoId: highlight.id,
    title: highlight.title,
    thumbnailUrl: highlight.thumbnailUrl
      ? { uri: highlight.thumbnailUrl } as ImageSourcePropType
      : require('@/assets/images/carusel-2.png') as ImageSourcePropType,
    badgeLabel: 'Series',
    badgeColor: '#2563EB',
  }));

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Program Highlights</Text>
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
        {displayData.map((highlight) => (
          <VideoCard
            key={highlight.id}
            imageSource={highlight.thumbnailUrl}
            title={highlight.title}
            badgeLabel={highlight.badgeLabel}
            badgeColor={highlight.badgeColor}
            showBadge={true}
            onPress={() => handleCardPress(highlight.videoId)}
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
