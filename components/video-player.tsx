import { useRouter } from 'expo-router';
import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { Badge } from './badge';

type VideoPlayerProps = {
  thumbnailSource: ImageSourcePropType;
  isLive?: boolean;
};

export function VideoPlayer({ thumbnailSource, isLive = false }: VideoPlayerProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleCast = () => {
    console.log('Cast pressed');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  const handlePictureInPicture = () => {
    console.log('Picture in Picture pressed');
  };

  return (
    <View style={styles.container}>
      <Image
        source={thumbnailSource}
        style={styles.thumbnail}
        resizeMode="contain"
      />
      
      {/* Top Controls */}
      <View style={styles.topControls}>
        {/* Back Button */}
        <Pressable onPress={handleBack} style={styles.controlButton}>
          <Image
            source={require('@/assets/Icons/dropdown.png')}
            style={[styles.icon]}
            resizeMode="contain"
          />
        </Pressable>

        {/* Right Controls */}
        <View style={styles.rightControls}>
          <Pressable onPress={handleCast} style={styles.controlButton}>
            <Image
              source={require('@/assets/Icons/picture.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </Pressable>
          <Pressable onPress={handleSettings} style={styles.controlButton}>
            <Image
              source={require('@/assets/Icons/settings.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Live Badge */}
        {isLive && (
          <View style={styles.liveBadge}>
            <Badge label="Live" dotColor="#FF0000" />
          </View>
        )}

        {/* Picture in Picture */}
        <Pressable onPress={handlePictureInPicture} style={styles.pipButton}>
          <Image
            source={require('@/assets/Icons/landscape.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 215,
    backgroundColor: '#000000',
    marginTop: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    marginTop: 20,
  },
  topControls: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
  },
  controlButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 12,
  },
  liveBadge: {
    // Badge component handles its own styling
  },
  pipButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
});
