import { AboutTab } from '@/components/channel-profile/about-tab';
import { HomeTab } from '@/components/channel-profile/home-tab';
import { LiveTab } from '@/components/channel-profile/live-tab';
import { ChannelProfileHeader } from '@/components/channel-profile/profile-header';
import { ScheduleTab } from '@/components/channel-profile/schedule-tab';
import { VideosTab } from '@/components/channel-profile/videos-tab';
import { styles } from '@/styles/channel-profile.styles';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChannel, useSubscribe, useUnsubscribe, useSubscriptionStatus } from '@/hooks/queries/useChannelQueries';

export default function ChannelProfileScreen() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug?: string }>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Live' | 'Videos' | 'Schedule' | 'About'>('Home');
  
  const { data: channel, isLoading, error } = useChannel(id);
  const { data: subscriptionStatus } = useSubscriptionStatus(id);
  const subscribeMutation = useSubscribe();
  const unsubscribeMutation = useUnsubscribe();
  
  const isSubscribed = subscriptionStatus?.isSubscribed || false;

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    // Search logic
  };

  const handleMenu = () => {
    // Menu logic
  };

  const handleSubscribe = () => {
    if (!id) return;
    if (isSubscribed) {
      unsubscribeMutation.mutate(id);
    } else {
      subscribeMutation.mutate(id);
    }
  };

  // Format subscriber count
  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#333', fontSize: 16 }}>No channel ID provided</Text>
        <Pressable onPress={handleBack} style={{ marginTop: 16, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ color: '#666', marginTop: 12 }}>Loading channel...</Text>
      </SafeAreaView>
    );
  }

  if (error || !channel) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#333', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}>
          Unable to load channel. The channel may not exist or there was a connection error.
        </Text>
        <Pressable onPress={handleBack} style={{ marginTop: 16, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const logoImage: ImageSourcePropType = channel.logoUrl 
    ? { uri: channel.logoUrl } 
    : require('@/assets/logo/Logo.png');
  
  const coverImage: ImageSourcePropType = channel.coverImageUrl 
    ? { uri: channel.coverImageUrl } 
    : require('@/assets/logo/Logo.png');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Back, Search, and Menu */}
      <View style={styles.header}>
        {/* Back Button */}
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <Image
            source={require('@/assets/Icons/back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>

        {/* Right Actions */}
        <View style={styles.headerRight}>
          <Pressable onPress={handleSearch} hitSlop={8}>
            <Image
              source={require('@/assets/Icons/search.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable onPress={handleMenu} hitSlop={8}>
            <Image
              source={require('@/assets/Icons/ellipsis.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Channel Profile Section */}
        <ChannelProfileHeader
          logoImage={coverImage}
          avatarImage={logoImage}
          channelName={channel.name}
          subscriberCount={`${formatCount(channel.subscriberCount)} subscribers`}
          videoCount={`${channel.videoCount} videos`}
          description={channel.description || 'No description available'}
          isSubscribed={isSubscribed}
          isLoading={subscribeMutation.isPending || unsubscribeMutation.isPending}
          onSubscribe={handleSubscribe}
        />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'Home' && styles.activeTab]}
            onPress={() => setActiveTab('Home')}
          >
            <Text style={[styles.tabText, activeTab === 'Home' && styles.activeTabText]}>
              Home
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.tab, activeTab === 'Live' && styles.activeTab]}
            onPress={() => setActiveTab('Live')}
          >
            <Text style={[styles.tabText, activeTab === 'Live' && styles.activeTabText]}>
              Live
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.tab, activeTab === 'Videos' && styles.activeTab]}
            onPress={() => setActiveTab('Videos')}
          >
            <Text style={[styles.tabText, activeTab === 'Videos' && styles.activeTabText]}>
              Videos
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.tab, activeTab === 'Schedule' && styles.activeTab]}
            onPress={() => setActiveTab('Schedule')}
          >
            <Text style={[styles.tabText, activeTab === 'Schedule' && styles.activeTabText]}>
              Schedule
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.tab, activeTab === 'About' && styles.activeTab]}
            onPress={() => setActiveTab('About')}
          >
            <Text style={[styles.tabText, activeTab === 'About' && styles.activeTabText]}>
              About
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Home' && <HomeTab channelId={id} channelName={channel.name} channelLogoUrl={channel.logoUrl} />}
          {activeTab === 'Live' && <LiveTab channelId={id} channelName={channel.name} />}
          {activeTab === 'Videos' && <VideosTab channelId={id} channelName={channel.name} />}
          {activeTab === 'Schedule' && <ScheduleTab channelId={id} />}
          {activeTab === 'About' && <AboutTab channel={channel} />}
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
