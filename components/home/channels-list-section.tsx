import { FONTS } from '@/styles/global';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChannelCard } from './channel-card';

export function ChannelsListSection() {
  const handleChannelPress = (channelName: string) => {
    console.log('Channel pressed:', channelName);
    router.push('/channel-profile');
  };

  const handleSeeAllPress = () => {
    console.log('See all channels pressed');
    // Navigation logic will go here
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Channels List</Text>
        <Pressable onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      {/* Channels Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <ChannelCard
          logoSource={require('@/assets/logo/Logo.png')}
          channelName="Rhapsody TV"
          isLive={true}
          onPress={() => handleChannelPress('Rhapsody TV')}
        />
        <ChannelCard
          logoSource={require('@/assets/logo/logo-2.png')}
          channelName="RORK TV"
          isLive={true}
          onPress={() => handleChannelPress('RORK TV')}
        />
        <ChannelCard
          logoSource={require('@/assets/logo/logo-3.png')}
          channelName="LingualTV"
          isLive={true}
          onPress={() => handleChannelPress('LingualTV')}
        />
        <ChannelCard
          logoSource={require('@/assets/logo/logo-1.png')}
          channelName="Rebroadcast Channel"
          isLive={true}
          onPress={() => handleChannelPress('Rebroadcast Channel')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#666666',
  },
  scrollView: {
    marginLeft: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
});
