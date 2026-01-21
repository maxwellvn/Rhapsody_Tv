import { FONTS } from '@/styles/global';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp, fs, spacing, borderRadius, dimensions } from '@/utils/responsive';
import { useQuery } from '@tanstack/react-query';
import { livestreamService } from '@/services/livestream.service';
import { Livestream } from '@/types/api.types';
import { Badge } from '../badge';

interface ScheduleLivestreamsSectionProps {
  channelId?: string | null;
}

interface LivestreamCardProps {
  livestream: Livestream;
  onPress: () => void;
}

function LivestreamCard({ livestream, onPress }: LivestreamCardProps) {
  const isLive = livestream.status === 'live';
  const isScheduled = livestream.status === 'scheduled';
  const isContinuous = livestream.scheduleType === 'continuous';

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
              : livestream.channel?.logoUrl
              ? { uri: livestream.channel.logoUrl }
              : require('@/assets/images/carusel-2.png')
          }
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
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
        
        {isScheduled && livestream.scheduledStartAt && (
          <Text style={styles.scheduleTime}>{formatScheduledTime()}</Text>
        )}
        
        {isContinuous && isLive && (
          <Text style={styles.continuousLabel}>Always Live</Text>
        )}
      </View>
    </Pressable>
  );
}

export function ScheduleLivestreamsSection({ channelId }: ScheduleLivestreamsSectionProps) {
  const router = useRouter();

  // Fetch livestreams (optionally filtered by channel)
  const { data, isLoading, error } = useQuery({
    queryKey: ['scheduleLivestreams', channelId],
    queryFn: async () => {
      if (channelId) {
        const response = await livestreamService.getByChannel(channelId);
        return response.data;
      }
      const response = await livestreamService.getLivestreams({ limit: 20 });
      return response.data;
    },
  });

  const handleLivestreamPress = (livestream: Livestream) => {
    router.push(`/live-video?id=${livestream.id}`);
  };

  // Don't show section if loading, error, or no livestreams
  if (isLoading || error || !data?.livestreams || data.livestreams.length === 0) {
    return null;
  }

  // Separate live now from upcoming
  const liveNow = data.livestreams.filter(l => l.status === 'live');
  const upcoming = data.livestreams.filter(l => l.status === 'scheduled');

  // Don't show if nothing to display
  if (liveNow.length === 0 && upcoming.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Live Now Section */}
      {liveNow.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Now</Text>
            <View style={styles.redDot} />
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {liveNow.map((livestream) => (
              <LivestreamCard
                key={livestream.id}
                livestream={livestream}
                onPress={() => handleLivestreamPress(livestream)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Livestreams</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {upcoming.map((livestream) => (
              <LivestreamCard
                key={livestream.id}
                livestream={livestream}
                onPress={() => handleLivestreamPress(livestream)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: dimensions.isTablet ? fs(18) : fs(16),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginRight: spacing.sm,
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
    width: dimensions.isTablet ? wp(200) : wp(160),
    marginRight: spacing.md,
  },
  thumbnailContainer: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: dimensions.isTablet ? hp(120) : hp(100),
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  infoContainer: {
    paddingTop: spacing.xs,
  },
  title: {
    fontSize: dimensions.isTablet ? fs(14) : fs(12),
    fontFamily: FONTS.semibold,
    color: '#000000',
    marginBottom: spacing.xxs,
  },
  channelName: {
    fontSize: dimensions.isTablet ? fs(12) : fs(11),
    fontFamily: FONTS.regular,
    color: '#666666',
  },
  scheduleTime: {
    fontSize: dimensions.isTablet ? fs(11) : fs(10),
    fontFamily: FONTS.medium,
    color: '#0066FF',
    marginTop: spacing.xxs,
  },
  continuousLabel: {
    fontSize: dimensions.isTablet ? fs(11) : fs(10),
    fontFamily: FONTS.medium,
    color: '#00AA00',
    marginTop: spacing.xxs,
  },
});
