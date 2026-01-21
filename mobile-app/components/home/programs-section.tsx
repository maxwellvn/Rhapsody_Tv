import { FONTS } from '@/styles/global';
import { useHomepagePrograms } from '@/hooks/queries/useHomepageQueries';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, ImageSourcePropType } from 'react-native';
import { VideoCard } from './video-card';
import { fs, spacing, dimensions } from '@/utils/responsive';
import { ProgramsSkeleton } from '../skeleton';

export function ProgramsSection() {
  const { data: programsData, isLoading, error } = useHomepagePrograms(10);

  const handleCardPress = (programId: string, videoId?: string, livestreamId?: string, isLive?: boolean) => {
    if (isLive && livestreamId) {
      router.push(`/live-video?id=${livestreamId}`);
    } else if (videoId) {
      router.push(`/video?id=${videoId}`);
    } else {
      router.push(`/program-profile?id=${programId}`);
    }
  };

  const handleSeeAllPress = () => {
    router.push('/(tabs)/discover');
  };

  if (isLoading) {
    return <ProgramsSkeleton />;
  }

  if (error || !programsData || programsData.length === 0) {
    return null; // Don't show section if no data
  }

  const displayData = programsData.map((program) => ({
    id: program.id,
    videoId: program.videoId,
    livestreamId: program.livestreamId,
    title: program.title,
    // Use thumbnailUrl first, fall back to channel cover image
    coverImageUrl: program.thumbnailUrl
      ? { uri: program.thumbnailUrl } as ImageSourcePropType
      : program.channel?.coverImageUrl
        ? { uri: program.channel.coverImageUrl } as ImageSourcePropType
        : require('@/assets/images/Image-4.png') as ImageSourcePropType,
    badgeLabel: program.isLive ? 'Live' : 'Series',
    badgeColor: program.isLive ? '#DC2626' : '#2563EB',
    isLive: program.isLive,
  }));

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
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
        {displayData.map((program) => (
          <VideoCard
            key={program.id}
            imageSource={program.coverImageUrl}
            title={program.title}
            badgeLabel={program.badgeLabel}
            badgeColor={program.badgeColor}
            showBadge={true}
            onPress={() => handleCardPress(program.id, program.videoId, program.livestreamId, program.isLive)}
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
