import { FONTS } from '@/styles/global';
import { useHomepageLivestreams } from '@/hooks/queries/useHomepageQueries';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../badge';
import { useRouter } from 'expo-router';
import { wp, hp, fs, spacing, borderRadius, dimensions } from '@/utils/responsive';
import { HomepageLivestream } from '@/types/api.types';

interface LivestreamCardProps {
  livestream: HomepageLivestream;
  onPress: () => void;
}

function LivestreamCard({ livestream, onPress }: LivestreamCardProps) {
  const isLive = livestream.status === 'live';
  const isScheduled = livestream.status === 'scheduled';
  const isContinuous = livestream.scheduleType === 'continuous';

  // Format the scheduled time
  const formatScheduledTime = () => {
    if (!livestream.scheduledStartAt) return null;
    const date = new Date(livestream.scheduledStartAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={
            livestream.thumbnailUrl
              ? { uri: livestream.thumbnailUrl }
              : livestream.channel?.coverImageUrl
              ? { uri: livestream.channel.coverImageUrl }
              : require('@/assets/images/carusel-2.png')
          }
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Status Badge */}
        <View style={styles.badgeContainer}>
          {isLive ? (
            <Badge label="LIVE" dotColor="#FF0000" />
          ) : isContinuous ? (
            <Badge label="24/7" dotColor="#00AA00" />
          ) : isScheduled ? (
            <Badge label="Upcoming" dotColor="#0066FF" />
          ) : null}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {livestream.title}
        </Text>
        
        {livestream.channel?.name && (
          <Text style={styles.channelName} numberOfLines={1}>
            {livestream.channel.name}
          </Text>
        )}
        
        {/* Show schedule info for scheduled streams */}
        {isScheduled && livestream.scheduledStartAt && (
          <Text style={styles.scheduleTime} numberOfLines={1}>
            {formatScheduledTime()}
          </Text>
        )}
        
        {/* Show "Always Live" for continuous streams */}
        {isContinuous && isLive && (
          <Text style={styles.continuousLabel}>Always Live</Text>
        )}
      </View>
    </Pressable>
  );
}

export function LivestreamsSection() {
  const router = useRouter();
  const { data: livestreams, isLoading, error } = useHomepageLivestreams(10);

  const handleLivestreamPress = (livestream: HomepageLivestream) => {
    router.push(`/live-video?id=${livestream.id}`);
  };

  // Don't show section if loading, error, or no livestreams
  if (isLoading || error || !livestreams || livestreams.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Live & Streaming</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.redDot} />
        </View>
      </View>

      {/* Horizontal Scroll List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {livestreams.map((livestream) => (
          <LivestreamCard
            key={livestream.id}
            livestream={livestream}
            onPress={() => handleLivestreamPress(livestream)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: dimensions.isTablet ? fs(22) : fs(18),
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  liveIndicator: {
    marginLeft: spacing.sm,
  },
  redDot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#FF0000',
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  card: {
    width: dimensions.isTablet ? wp(280) : wp(220),
    marginRight: spacing.md,
  },
  thumbnailContainer: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: dimensions.isTablet ? hp(160) : hp(130),
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  infoContainer: {
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: dimensions.isTablet ? fs(16) : fs(14),
    fontFamily: FONTS.semibold,
    color: '#000000',
    marginBottom: spacing.xxs,
  },
  channelName: {
    fontSize: dimensions.isTablet ? fs(14) : fs(12),
    fontFamily: FONTS.regular,
    color: '#666666',
  },
  scheduleTime: {
    fontSize: dimensions.isTablet ? fs(12) : fs(11),
    fontFamily: FONTS.medium,
    color: '#0066FF',
    marginTop: spacing.xxs,
  },
  continuousLabel: {
    fontSize: dimensions.isTablet ? fs(12) : fs(11),
    fontFamily: FONTS.medium,
    color: '#00AA00',
    marginTop: spacing.xxs,
  },
});
