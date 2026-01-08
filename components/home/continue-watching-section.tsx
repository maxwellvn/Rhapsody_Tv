import { FONTS } from '@/styles/global';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { VideoCard } from './video-card';

export function ContinueWatchingSection() {
  const handleCardPress = (title: string) => {
    console.log('Card pressed:', title);
    // Navigation logic will go here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue Watching</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <VideoCard
          imageSource={require('@/assets/images/carusel-2.png')}
          title="Your Loveworld Special with Pastor Chris Season 2 Phase 7"
          badgeLabel="Live"
          badgeColor="#FF0000"
          showBadge={true}
          onPress={() => handleCardPress('Your Loveworld Special')}
        />
        <VideoCard
          imageSource={require('@/assets/images/Image-2.png')}
          title="Night Of A Thousand Crusades HIGHLIGHT 3"
          badgeLabel="New"
          badgeColor="#2563EB"
          showBadge={true}
          onPress={() => handleCardPress('Night Of A Thousand Crusades')}
        />
        <VideoCard
          imageSource={require('@/assets/images/Image-1.png')}
          title="Rhapsody On The Daily Frontier"
          badgeLabel="Live"
          badgeColor="#FF0000"
          showBadge={true}
          onPress={() => handleCardPress('Rhapsody Of Realities')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
    marginBottom: 7,
  },
  scrollView: {
    marginLeft: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
});
