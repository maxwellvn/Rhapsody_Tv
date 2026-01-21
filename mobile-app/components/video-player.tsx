import { dimensions, hp, spacing, wp } from '@/utils/responsive';
import { useEvent } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { Badge } from './badge';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type VideoPlayerProps = {
  videoUri?: string;
  thumbnailSource?: ImageSourcePropType;
  isLive?: boolean;
  showBackButton?: boolean;
};

export function VideoPlayer({ videoUri, thumbnailSource, isLive = false, showBackButton = true }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const videoViewRef = useRef<VideoView>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const player = useVideoPlayer(videoUri || null, (player) => {
    if (videoUri) {
      player.loop = isLive;
      player.play();
    }
  });

  // Listen to status changes
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (status === 'readyToPlay') {
      setIsLoading(false);
    } else if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'error') {
      setIsLoading(false);
    }
  }, [status]);

  const handleFullscreenEnter = async () => {
    // Lock to landscape when entering fullscreen
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

  const handleFullscreenExit = async () => {
    // Unlock orientation when exiting fullscreen
    await ScreenOrientation.unlockAsync();
  };

  // Show/hide controls based on interaction
  const handleContainerPress = useCallback(() => {
    setShowControls(true);
    
    // Clear existing timeout
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    
    // Hide after 3 seconds
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <Pressable style={styles.container} onPress={handleContainerPress}>
      {videoUri ? (
        <>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={true}
            fullscreenOptions={{
              enable: true,
              orientation: 'landscape',
            }}
            onFullscreenEnter={handleFullscreenEnter}
            onFullscreenExit={handleFullscreenExit}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}

          {/* Custom Overlay Controls */}
          <View style={styles.overlay} pointerEvents="box-none">
            {/* Back Button */}
            {showBackButton && showControls && (
              <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
                <Ionicons name="arrow-back" size={wp(24)} color="#FFFFFF" />
              </Pressable>
            )}

            {/* Live Badge Overlay */}
            {isLive && (
              <View style={styles.liveBadgeContainer}>
                <Badge label="Live" dotColor="#FF0000" />
              </View>
            )}
          </View>
        </>
      ) : (
        <>
          <Image
            source={thumbnailSource || require('@/assets/images/carusel-2.png')}
            style={styles.thumbnail}
            resizeMode="contain"
          />
          {/* Back Button for thumbnail view */}
          {showBackButton && (
            <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
              <Ionicons name="arrow-back" size={wp(24)} color="#FFFFFF" />
            </Pressable>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: dimensions.isTablet ? hp(330) : hp(225),
    backgroundColor: '#000000',
    marginTop: 0,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    marginTop: dimensions.isTablet ? spacing.lg : spacing.md,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: hp(12),
    left: wp(12),
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  liveBadgeContainer: {
    position: 'absolute',
    top: dimensions.isTablet ? spacing.xl : spacing.lg,
    left: wp(60), // Moved to the right of back button
    zIndex: 5,
  },
});
