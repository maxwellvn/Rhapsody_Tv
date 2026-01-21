import { FONTS } from '@/styles/global';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp, fs, spacing, borderRadius, dimensions } from '@/utils/responsive';
import { useQuery } from '@tanstack/react-query';
import { livestreamService } from '@/services/livestream.service';
import { Livestream } from '@/types/api.types';
import { Badge } from '../badge';
import { useRef, useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CARD_MARGIN = spacing.sm;

interface LiveNowCardProps {
  livestream: Livestream;
  onPress: () => void;
}

function LiveNowCard({ livestream, onPress }: LiveNowCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.liveNowCard}>
      <Image
        source={
          livestream.thumbnailUrl
            ? { uri: livestream.thumbnailUrl }
            : livestream.channel?.coverImageUrl
            ? { uri: livestream.channel.coverImageUrl }
            : require('@/assets/images/carusel-2.png')
        }
        style={styles.liveNowImage}
        resizeMode="cover"
      />
      
      {/* Gradient overlay */}
      <View style={styles.liveNowOverlay} />
      
      {/* Badge */}
      <View style={styles.liveNowBadge}>
        <Badge label="LIVE" dotColor="#FF0000" />
      </View>
      
      {/* Content */}
      <View style={styles.liveNowContent}>
        <Text style={styles.liveNowTitle} numberOfLines={2}>
          {livestream.title}
        </Text>
        
        <View style={styles.liveNowMeta}>
          {livestream.channel?.logoUrl && (
            <Image
              source={{ uri: livestream.channel.logoUrl }}
              style={styles.liveNowChannelLogo}
              resizeMode="cover"
            />
          )}
          <Text style={styles.liveNowChannelName} numberOfLines={1}>
            {livestream.channel?.name || 'Rhapsody TV'}
          </Text>
          {livestream.viewerCount !== undefined && livestream.viewerCount > 0 && (
            <Text style={styles.liveNowViewers}>
              {livestream.viewerCount.toLocaleString()} watching
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function ScheduleLivestreamsSection() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch all livestreams (live now)
  const { data, isLoading, error } = useQuery({
    queryKey: ['scheduleLivestreams'],
    queryFn: async () => {
      const response = await livestreamService.getLiveNow();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLivestreamPress = (livestream: Livestream) => {
    router.push(`/live-video?id=${livestream.id}`);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(index);
  };

  // Don't show section if loading, error, or no live streams
  if (isLoading || error || !data?.livestreams || data.livestreams.length === 0) {
    return null;
  }

  const liveNow = data.livestreams;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Now</Text>
        <View style={styles.redDot} />
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
        contentContainerStyle={styles.carouselContent}
      >
        {liveNow.map((livestream) => (
          <LiveNowCard
            key={livestream.id}
            livestream={livestream}
            onPress={() => handleLivestreamPress(livestream)}
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {liveNow.length > 1 && (
        <View style={styles.pagination}>
          {liveNow.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: dimensions.isTablet ? fs(20) : fs(18),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginRight: spacing.sm,
  },
  redDot: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FF0000',
  },
  carouselContent: {
    paddingRight: spacing.xl,
  },
  liveNowCard: {
    width: CARD_WIDTH,
    height: dimensions.isTablet ? hp(220) : hp(180),
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: CARD_MARGIN,
    backgroundColor: '#000',
  },
  liveNowImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  liveNowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  liveNowBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  liveNowContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  liveNowTitle: {
    fontSize: dimensions.isTablet ? fs(18) : fs(16),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  liveNowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveNowChannelLogo: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    marginRight: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  liveNowChannelName: {
    fontSize: dimensions.isTablet ? fs(14) : fs(12),
    fontFamily: FONTS.medium,
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liveNowViewers: {
    fontSize: dimensions.isTablet ? fs(12) : fs(11),
    fontFamily: FONTS.regular,
    color: '#CCCCCC',
    marginLeft: spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  paginationDot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#D9D9D9',
    marginHorizontal: spacing.xxs,
  },
  paginationDotActive: {
    backgroundColor: '#2563EB',
    width: wp(24),
  },
});
