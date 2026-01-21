import { ChannelCard } from '@/components/schedule/channel-card';
import { FONTS } from '@/styles/global';
import { fs, hp, wp, borderRadius } from '@/utils/responsive';
import { ActivityIndicator, ImageSourcePropType, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHomepageChannels } from '@/hooks/queries/useHomepageQueries';
import { Skeleton } from '@/components/skeleton';

interface ScheduleChannelsListProps {
  onChannelSelect?: (channelId: string) => void;
  selectedChannelId?: string | null;
}

export function ScheduleChannelsList({ onChannelSelect, selectedChannelId }: ScheduleChannelsListProps) {
  const { data: channels, isLoading, error } = useHomepageChannels(20);

  const handleChannelPress = (channelId: string) => {
    if (onChannelSelect) {
      onChannelSelect(channelId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Channels List</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <Skeleton width={wp(80)} height={hp(80)} borderRadius={borderRadius.md} />
              <Skeleton width={wp(70)} height={fs(12)} borderRadius={borderRadius.xs} style={{ marginTop: 8 }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error || !channels || channels.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Channels List</Text>
        </View>
        <Text style={styles.emptyText}>No channels available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Channels List</Text>
      </View>

      {/* Channels Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            logoSource={
              channel.logoUrl
                ? { uri: channel.logoUrl } as ImageSourcePropType
                : require('@/assets/logo/Logo.png') as ImageSourcePropType
            }
            channelName={channel.name}
            isLive={selectedChannelId === channel.id}
            onPress={() => handleChannelPress(channel.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(12),
  },
  title: {
    fontSize: fs(22),
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  scrollView: {
    marginLeft: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
  skeletonCard: {
    width: wp(80),
    marginRight: 12,
  },
  emptyText: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#666666',
    paddingVertical: 20,
  },
});
