import { Text, View, StyleSheet, ActivityIndicator, ImageSourcePropType } from 'react-native';
import { ChannelCard } from './channel-card';
import { FONTS } from '@/styles/global';
import { useHomepageChannels } from '@/hooks/queries/useHomepageQueries';
import { router } from 'expo-router';

export function ChannelsTab() {
  const { data: channels, isLoading, error } = useHomepageChannels(20);

  const handleChannelPress = (channelId: string, channelSlug: string) => {
    router.push(`/channel-profile?slug=${channelSlug}&id=${channelId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !channels || channels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No channels available</Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Channels</Text>
      <View style={styles.grid}>
        {channels.map((channel) => (
          <View key={channel.id} style={styles.channelCardWrapper}>
            <ChannelCard
              logoSource={
                channel.logoUrl
                  ? { uri: channel.logoUrl } as ImageSourcePropType
                  : require('@/assets/logo/Logo.png') as ImageSourcePropType
              }
              channelName={channel.name}
              isLive={false}
              onPress={() => handleChannelPress(channel.id, channel.slug)}
            />
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  channelCardWrapper: {
    width: '47%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#666666',
  },
});
