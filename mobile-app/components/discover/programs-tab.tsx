import { FONTS } from '@/styles/global';
import { StyleSheet, Text, View, ActivityIndicator, ImageSourcePropType } from 'react-native';
import { VideoCard } from './video-card';
import { useHomepagePrograms } from '@/hooks/queries/useHomepageQueries';
import { router } from 'expo-router';

export function ProgramsTab() {
  const { data: programs, isLoading, error } = useHomepagePrograms(20);

  const handleProgramPress = (programId: string, videoId?: string, livestreamId?: string, isLive?: boolean) => {
    if (isLive && livestreamId) {
      router.push(`/live-video?id=${livestreamId}`);
    } else if (videoId) {
      router.push(`/video?id=${videoId}`);
    } else {
      router.push(`/program-profile?id=${programId}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !programs || programs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No programs available</Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Programs</Text>
      <View style={styles.grid}>
        {programs.map((program) => (
          <View key={program.id} style={styles.videoCardWrapper}>
            <VideoCard
              imageSource={
                program.thumbnailUrl
                  ? { uri: program.thumbnailUrl } as ImageSourcePropType
                  : program.channel?.coverImageUrl
                    ? { uri: program.channel.coverImageUrl } as ImageSourcePropType
                    : require('@/assets/images/Image-4.png') as ImageSourcePropType
              }
              title={program.title}
              badgeLabel={program.isLive ? 'Live' : 'Series'}
              badgeColor={program.isLive ? '#DC2626' : '#2563EB'}
              showBadge={true}
              onPress={() => handleProgramPress(program.id, program.videoId, program.livestreamId, program.isLive)}
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
  videoCardWrapper: {
    width: '47.5%',
    marginBottom: 8,
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
