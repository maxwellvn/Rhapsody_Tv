import { BottomNav } from '@/components/bottom-nav';
import { ChannelsTab } from '@/components/discover/channels-tab';
import { ProgramsTab } from '@/components/discover/programs-tab';
import { SearchBar } from '@/components/search-bar';
import { homepageKeys } from '@/hooks/queries/useHomepageQueries';
import { styles } from '@/styles/discover.styles';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, useEffect } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

export default function DiscoverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  
  // Determine active tab from params, defaulting to Channels
  const activeTab = params.tab === 'programs' ? 'Programs' : 'Channels';
  
  const setActiveTab = (tab: 'Channels' | 'Programs') => {
    // Update the URL param to persist the tab state
    router.setParams({ tab: tab.toLowerCase() });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalidate channels and programs queries
    await queryClient.invalidateQueries({ queryKey: homepageKeys.channels() });
    await queryClient.invalidateQueries({ queryKey: homepageKeys.programs() });
    setRefreshing(false);
  }, [queryClient]);

  const handleSearch = (text: string) => {
    console.log('Search:', text);
  };

  const handleTabPress = (tab: string) => {
    if (tab === 'Home') {
      router.push('/(tabs)');
    } else if (tab === 'Schedule') {
      router.push('/(tabs)/schedule');
    } else if (tab === 'Profile') {
      router.push('/(tabs)/profile');
    } else if (tab === 'Discover') {
      // Already on discover
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/Icons/Discover.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar 
          placeholder="Search channels..."
          onSearch={handleSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tab, styles.firstTab, activeTab === 'Channels' && styles.activeTab]}
          onPress={() => setActiveTab('Channels')}
        >
          <Text style={[styles.tabText, activeTab === 'Channels' && styles.activeTabText]}>
            Channels
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, styles.lastTab, activeTab === 'Programs' && styles.activeTab]}
          onPress={() => setActiveTab('Programs')}
        >
          <Text style={[styles.tabText, activeTab === 'Programs' && styles.activeTabText]}>
            Programs
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {activeTab === 'Channels' ? <ChannelsTab /> : <ProgramsTab />}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Discover" onTabPress={handleTabPress} />
    </View>
  );
}
