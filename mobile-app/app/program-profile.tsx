import { AboutTab } from '@/components/program-profile/about-tab';
import { HomeTab } from '@/components/program-profile/home-tab';
import { LiveTab } from '@/components/program-profile/live-tab';
import { ProgramProfileHeader } from '@/components/program-profile/profile-header';
import { VideosTab } from '@/components/program-profile/videos-tab';
import { styles } from '@/styles/program-profile.styles';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgramDetail, useProgramSubscriptionStatus, useProgramSubscribe, useProgramUnsubscribe } from '@/hooks/queries/useProgramQueries';

export default function ProgramProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'Home' | 'Live' | 'Videos' | 'About'>('Home');

  const { data: program, isLoading, error } = useProgramDetail(id);
  const { data: subscriptionStatus } = useProgramSubscriptionStatus(id);
  const subscribeMutation = useProgramSubscribe();
  const unsubscribeMutation = useProgramUnsubscribe();
  
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

  // Format count for display
  const formatCount = (count: number | undefined): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#333', fontSize: 16 }}>No program ID provided</Text>
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
        <Text style={{ color: '#666', marginTop: 12 }}>Loading program...</Text>
      </SafeAreaView>
    );
  }

  if (error || !program) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#333', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}>
          Unable to load program. The program may not exist or there was a connection error.
        </Text>
        <Pressable onPress={handleBack} style={{ marginTop: 16, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const coverImage: ImageSourcePropType = program.coverImageUrl 
    ? { uri: program.coverImageUrl } 
    : require('@/assets/images/Image-11.png');
  
  const avatarImage: ImageSourcePropType = program.channel?.logoUrl 
    ? { uri: program.channel.logoUrl } 
    : require('@/assets/images/Avatar.png');

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
        {/* Program Profile Section */}
        <ProgramProfileHeader
          bannerImage={coverImage}
          avatarImage={avatarImage}
          channelName={program.title}
          subscriberCount={`${formatCount(program.subscriberCount)} subscribers`}
          videoCount={`${formatCount(program.videoCount)} videos`}
          description={program.description || 'No description available'}
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
          {activeTab === 'Home' && <HomeTab programId={id} programName={program.title} channelName={program.channel?.name} />}
          {activeTab === 'Live' && <LiveTab programId={id} programName={program.title} />}
          {activeTab === 'Videos' && <VideosTab programId={id} programName={program.title} />}
          {activeTab === 'About' && <AboutTab program={program} />}
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}
