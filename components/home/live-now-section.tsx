import { FONTS } from '@/styles/global';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../badge';

export function LiveNowSection() {
  const handleLivePress = () => {
    console.log('Live video pressed');
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Live Now</Text>
        <View style={styles.redDot} />
      </View>

      {/* Live Video Card */}
      <Pressable onPress={handleLivePress} style={styles.videoCard}>
        <Image
          source={require('@/assets/images/carusel-2.png')}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.liveBadgeContainer}>
          <Badge label="Live" dotColor="#FF0000" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
    marginRight: 4,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  videoCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  liveBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
});
