import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet, View } from 'react-native';

type UploadedVideoPlayerProps = {
  thumbnailSource: ImageSourcePropType;
};

export function UploadedVideoPlayer({ thumbnailSource }: UploadedVideoPlayerProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      // Lock to landscape when entering fullscreen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      // Unlock or return to portrait when exiting fullscreen
      ScreenOrientation.unlockAsync();
    }

    // Cleanup: unlock orientation when component unmounts
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isFullscreen]);

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderVideoPlayer = (fullscreen: boolean) => (
    <View style={fullscreen ? styles.fullscreenContainer : styles.container}>
      <Image
        source={thumbnailSource}
        style={fullscreen ? styles.fullscreenThumbnail : styles.thumbnail}
        resizeMode={fullscreen ? "cover" : "contain"}
      />
      
      {/* Top Controls */}
      <View style={fullscreen ? styles.fullscreenTopControls : styles.topControls}>
        {/* Back Button */}
        <Pressable onPress={handleBack} style={styles.controlButton}>
          <Image
            source={require('@/assets/Icons/dropdown.png')}
            style={[styles.icon]}
            resizeMode="contain"
          />
        </Pressable>

        {/* Right Controls - Only Settings (No Cast button) */}
        <View style={styles.rightControls}>
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
      <View style={fullscreen ? styles.fullscreenBottomControls : styles.bottomControls}>
        {/* Fullscreen Toggle - No Live Badge */}
        <Pressable onPress={handleFullscreen} style={styles.pipButton}>
          <Image
            source={
              fullscreen
                ? require('@/assets/Icons/portrait.png')
                : require('@/assets/Icons/landscape.png')
            }
            style={styles.icon}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      {/* Normal Player */}
      {!isFullscreen && renderVideoPlayer(false)}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
        supportedOrientations={['landscape', 'portrait']}
      >
        <StatusBar style="light" hidden />
        {renderVideoPlayer(true)}
      </Modal>
    </>
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
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    marginTop: 20,
  },
  fullscreenThumbnail: {
    width: '100%',
    height: '100%',
    marginLeft: 0,
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
  fullscreenTopControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingTop: 12,
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
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 12,
  },
  fullscreenBottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 12,
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
