import { dimensions, hp, spacing, wp } from '@/utils/responsive';
import { useEvent } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type UploadedVideoPlayerProps = {
  videoUri?: string;
  thumbnailSource: ImageSourcePropType;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onVideoEnd?: () => void;
};

export function UploadedVideoPlayer({ 
  videoUri, 
  thumbnailSource,
  onProgressUpdate,
  onVideoEnd,
}: UploadedVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showBackButton, setShowBackButton] = useState(true);
  const videoViewRef = useRef<VideoView>(null);
  const lastProgressRef = useRef<number>(0);
  const hideBackButtonTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const player = useVideoPlayer(videoUri || null, (player) => {
    if (videoUri) {
      player.loop = false;
      player.play();
    }
  });

  // Listen to status changes
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  
  // Listen to playback state (playing/paused)
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Track progress periodically
  useEffect(() => {
    if (!player || !onProgressUpdate) return;
    
    const progressInterval = setInterval(() => {
      try {
        const currentTime = player.currentTime || 0;
        const duration = player.duration || 0;
        
        // Only update if progress changed significantly (every 5 seconds)
        if (duration > 0 && Math.abs(currentTime - lastProgressRef.current) >= 5) {
          lastProgressRef.current = currentTime;
          onProgressUpdate(currentTime, duration);
        }
      } catch (e) {
        // Player might not be ready
      }
    }, 5000);
    
    return () => clearInterval(progressInterval);
  }, [player, onProgressUpdate]);

  // Detect video end
  useEffect(() => {
    if (status === 'readyToPlay' && player) {
      try {
        const currentTime = player.currentTime || 0;
        const duration = player.duration || 0;
        
        // If we're at the end (within 1 second)
        if (duration > 0 && currentTime >= duration - 1 && !isPlaying) {
          onVideoEnd?.();
        }
      } catch (e) {
        // Player might not be ready
      }
    }
  }, [isPlaying, status, player, onVideoEnd]);

  // Show/hide back button based on interaction
  const handleContainerPress = useCallback(() => {
    setShowBackButton(true);
    
    // Clear existing timeout
    if (hideBackButtonTimeout.current) {
      clearTimeout(hideBackButtonTimeout.current);
    }
    
    // Hide after 3 seconds
    hideBackButtonTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowBackButton(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Keep back button visible when paused
  useEffect(() => {
    if (!isPlaying) {
      setShowBackButton(true);
    }
  }, [isPlaying]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideBackButtonTimeout.current) {
        clearTimeout(hideBackButtonTimeout.current);
      }
    };
  }, []);

  const handleBack = () => {
    // Save final progress before leaving
    if (player && onProgressUpdate) {
      try {
        const currentTime = player.currentTime || 0;
        const duration = player.duration || 0;
        if (duration > 0) {
          onProgressUpdate(currentTime, duration);
        }
      } catch (e) {
        // Player might not be ready
      }
    }
    router.back();
  };

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

          {/* Back Button */}
          {showBackButton && (
            <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
              <Ionicons name="arrow-back" size={wp(24)} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </>
      ) : (
        <>
          <Image
            source={thumbnailSource}
            style={styles.thumbnail}
            resizeMode="contain"
          />
          {/* Back Button for thumbnail view */}
          <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={wp(24)} color="#FFFFFF" />
          </Pressable>
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
});
