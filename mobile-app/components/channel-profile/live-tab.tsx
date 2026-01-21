import { FONTS } from '@/styles/global';
import { Image, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp, fs, spacing, borderRadius, dimensions } from '@/utils/responsive';
import { useQuery } from '@tanstack/react-query';
import { livestreamService } from '@/services/livestream.service';
import { Livestream } from '@/types/api.types';
import { Badge } from '../badge';

interface LiveTabProps {
  channelId: string;
  channelName: string;
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
        
        {livestream.description && (
          <Text style={styles.description} numberOfLines={2}>
            {livestream.description}
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

export function LiveTab({ channelId, channelName }: LiveTabProps) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['channelLivestreams', channelId],
    queryFn: async () => {
      console.log('[LiveTab] Fetching livestreams for channel:', channelId);
      const response = await livestreamService.getByChannel(channelId);
      console.log('[LiveTab] Response:', JSON.stringify(response, null, 2));
      return response.data;
    },
    enabled: !!channelId,
  });

  const handleLivestreamPress = (livestream: Livestream) => {
    router.push(`/live-video?id=${livestream.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !data?.livestreams || data.livestreams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Livestreams</Text>
        <Text style={styles.emptyText}>
          {channelName} doesn't have any active or upcoming livestreams right now.
        </Text>
      </View>
    );
  }

  // Separate live streams from scheduled ones
  const liveNow = data.livestreams.filter(l => l.status === 'live');
  const scheduled = data.livestreams.filter(l => l.status === 'scheduled');

  return (
    <View style={styles.container}>
      {/* Currently Live */}
      {liveNow.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Now</Text>
            <View style={styles.redDot} />
          </View>
          {liveNow.map((livestream) => (
            <LivestreamCard
              key={livestream.id}
              livestream={livestream}
              onPress={() => handleLivestreamPress(livestream)}
            />
          ))}
        </View>
      )}

      {/* Upcoming */}
      {scheduled.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {scheduled.map((livestream) => (
            <LivestreamCard
              key={livestream.id}
              livestream={livestream}
              onPress={() => handleLivestreamPress(livestream)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fs(18),
    fontFamily: FONTS.semibold,
    color: '#333',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fs(18),
    fontFamily: FONTS.bold,
    color: '#000',
    marginRight: spacing.sm,
  },
  redDot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#FF0000',
  },
  card: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: '#F8F8F8',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: dimensions.isTablet ? wp(180) : wp(140),
    height: dimensions.isTablet ? hp(110) : hp(90),
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  infoContainer: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  title: {
    fontSize: fs(14),
    fontFamily: FONTS.semibold,
    color: '#000',
    marginBottom: spacing.xxs,
  },
  description: {
    fontSize: fs(12),
    fontFamily: FONTS.regular,
    color: '#666',
    marginBottom: spacing.xs,
  },
  scheduleTime: {
    fontSize: fs(12),
    fontFamily: FONTS.medium,
    color: '#0066FF',
  },
  continuousLabel: {
    fontSize: fs(12),
    fontFamily: FONTS.medium,
    color: '#00AA00',
  },
});
