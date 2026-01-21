import { ScheduleHeader } from '@/components/schedule/schedule-header';
import { ScheduleProgramCard } from '@/components/schedule/schedule-program-card';
import { FONTS } from '@/styles/global';
import { fs } from '@/utils/responsive';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useChannelSchedule } from '@/hooks/queries/useScheduleQueries';
import { router } from 'expo-router';

interface ScheduleTabProps {
  channelId: string;
}

export function ScheduleTab({ channelId }: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const dateString = selectedDate.toISOString().split('T')[0];
  const { data: scheduleData, isLoading, error } = useChannelSchedule(channelId, dateString);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleWatchNow = (programId: string, isLive: boolean, livestreamId?: string) => {
    if (isLive && livestreamId) {
      router.push(`/live-video?id=${livestreamId}`);
    } else {
      router.push(`/program-profile?id=${programId}`);
    }
  };

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
      {/* Schedule Header */}
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
          <Text style={styles.emptyText}>Failed to load schedule</Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!scheduleData || scheduleData.length === 0) && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No programs scheduled for this date</Text>
        </View>
      )}

      {/* Schedule Programs */}
      {!isLoading && !error && scheduleData && scheduleData.map((program) => (
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
          onWatchNowPress={() => handleWatchNow(program.id, program.isLive, program.livestreamId)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
