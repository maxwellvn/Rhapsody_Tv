import { BottomNav } from '@/components/bottom-nav';
import { ScheduleChannelsList } from '@/components/schedule/channels-list';
import { ScheduleHeader } from '@/components/schedule/schedule-header';
import { ScheduleProgramCard } from '@/components/schedule/schedule-program-card';
import { ScheduleLivestreamsSection } from '@/components/schedule/schedule-livestreams-section';
import { FONTS } from '@/styles/global';
import { borderRadius, fs, hp, platformValue, spacing, wp } from '@/utils/responsive';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { scheduleKeys, useSchedule } from '@/hooks/queries/useScheduleQueries';

export default function ScheduleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Format date for API call
  const dateString = selectedDate.toISOString().split('T')[0];
  const { data: scheduleData, isLoading, error } = useSchedule(dateString);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalidate schedule queries to trigger refetch
    await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    setRefreshing(false);
  }, [queryClient]);

  const handleTabPress = (tab: string) => {
    if (tab === 'Home') {
      router.push('/(tabs)');
    } else if (tab === 'Discover') {
      router.push('/(tabs)/discover');
    } else if (tab === 'Profile') {
      router.push('/(tabs)/profile');
    } else if (tab === 'Schedule') {
      // Already on schedule
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId === selectedChannelId ? null : channelId);
  };

  const handleProgramPress = (programId: string, isLive: boolean, livestreamId?: string) => {
    if (isLive && livestreamId) {
      router.push(`/live-video?id=${livestreamId}`);
    } else {
      router.push(`/program-profile?id=${programId}`);
    }
  };

  // Filter schedule by selected channel if one is selected
  const filteredSchedule = selectedChannelId
    ? scheduleData?.filter((program) => program.channelId === selectedChannelId)
    : scheduleData;

  // Helper to format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Helper to calculate duration in hours
  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''}`;
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
        <Text style={styles.title}>Schedule</Text>
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
        <ScheduleChannelsList 
          onChannelSelect={handleChannelSelect}
          selectedChannelId={selectedChannelId}
        />
        
        {/* Live & Upcoming Livestreams Section */}
        <ScheduleLivestreamsSection channelId={selectedChannelId} />
        
        <ScheduleHeader 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
        
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Unable to load schedule. Please try again later.</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!filteredSchedule || filteredSchedule.length === 0) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No programs scheduled for this date</Text>
          </View>
        )}

        {/* Program Schedule List */}
        {!isLoading && !error && filteredSchedule && filteredSchedule.map((program) => (
          <ScheduleProgramCard
            key={program.id}
            time={formatTime(program.startTime)}
            duration={getDuration(program.startTime, program.endTime)}
            category={program.category || 'PROGRAM'}
            title={program.title}
            description={program.description || ''}
            thumbnailUrl={program.thumbnailUrl}
            watchingCount={program.isLive ? '645' : '0'}
            isLive={program.isLive}
            onPress={() => handleProgramPress(program.id, program.isLive, program.livestreamId)}
            onWatchNowPress={() => {
              if (program.isLive && program.livestreamId) {
                router.push(`/live-video?id=${program.livestreamId}`);
              } else {
                // Navigate to program profile for non-live programs
                router.push(`/program-profile?id=${program.id}`);
              }
            }}
          />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Schedule" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: platformValue(hp(49), hp(46)),
    paddingBottom: hp(8),
    paddingHorizontal: spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: wp(45),
    height: hp(45),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: wp(24),
    height: hp(24),
    tintColor: '#000000',
  },
  title: {
    fontSize: fs(28),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: hp(10),
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#666666',
  },
});
