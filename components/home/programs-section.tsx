import { FONTS } from '@/styles/global';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VideoCard } from './video-card';

export function ProgramsSection() {
  const handleCardPress = (title: string) => {
    console.log('Program pressed:', title);
    // Navigation logic will go here
  };

  const handleSeeAllPress = () => {
    console.log('See all programs pressed');
    // Navigation logic will go here
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
        <Pressable onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      {/* Videos Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <VideoCard
          imageSource={require('@/assets/images/Image-4.png')}
          title="Rhapsody Dailies"
          badgeLabel="Series"
          badgeColor="#2563EB"
          showBadge={true}
          onPress={() => handleCardPress('Your Loveworld Special')}
        />
        <VideoCard
          imageSource={require('@/assets/images/Image-1.png')}
          title="Rhapsody On The Daily Frontier"
          badgeLabel="New"
          badgeColor="#2563EB"
          showBadge={true}
          onPress={() => handleCardPress('Nothing on Media is Neutral')}
        />
        <VideoCard
          imageSource={require('@/assets/images/Image-5.png')}
          title="The Day God Spoke My Language"
          badgeLabel="Live"
          badgeColor="#DC2626"
          showBadge={true}
          onPress={() => handleCardPress('Night Of A Thousand Crusades')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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
