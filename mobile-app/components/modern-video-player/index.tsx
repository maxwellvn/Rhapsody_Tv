import { dimensions, hp, wp, fs } from '@/utils/responsive';
import { useEvent } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Badge } from '../badge';
import { usePiP } from '@/contexts/pip-context';
import { FONTS } from '@/styles/global';
import { LinearGradient } from 'expo-linear-gradient';

export type ModernVideoPlayerProps = {
  videoUri?: string;
  thumbnailSource?: ImageSourcePropType;
  isLive?: boolean;
  showBackButton?: boolean;
  title?: string;
  channelName?: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onVideoEnd?: () => void;
  videoId?: string;
  allowPiP?: boolean;
};

export function ModernVideoPlayer({
  videoUri,
  thumbnailSource,
  isLive = false,
  showBackButton = true,
  title,
  channelName,
  onProgressUpdate,
  onVideoEnd,
  videoId,
  allowPiP = true,
}: ModernVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoViewRef = useRef<VideoView>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProgressRef = useRef<number>(0);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const { enterPiP } = usePiP();

  const player = useVideoPlayer(videoUri || null, (player) => {
    if (videoUri) {
      player.loop = isLive;
      player.play();
    }
  });

  // Listen to status changes
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Update time display
  useEffect(() => {
    if (!player || isSeeking) return;

    const interval = setInterval(() => {
      try {
        const time = player.currentTime || 0;
        const dur = player.duration || 0;
        setCurrentTime(time);
        setDuration(dur);

        // Progress tracking for watch history
        if (onProgressUpdate && dur > 0 && Math.abs(time - lastProgressRef.current) >= 5) {
          lastProgressRef.current = time;
          onProgressUpdate(time, dur);
        }

        // Check for video end
        if (dur > 0 && time >= dur - 0.5 && !isPlaying && !isLive) {
          onVideoEnd?.();
        }
      } catch (e) {
        // Player might not be ready
      }
    }, 250);

    return () => clearInterval(interval);
  }, [player, isSeeking, onProgressUpdate, onVideoEnd, isPlaying, isLive]);

  useEffect(() => {
    if (status === 'readyToPlay') {
      setIsLoading(false);
    } else if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'error') {
      setIsLoading(false);
    }
  }, [status]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 3000);
    }
  }, [isPlaying, controlsOpacity]);

  const showControlsWithAnimation = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    resetHideTimer();
  }, [controlsOpacity, resetHideTimer]);

  useEffect(() => {
    if (!isPlaying) {
      showControlsWithAnimation();
    } else {
      resetHideTimer();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  const handleContainerPress = () => {
    if (showControls) {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    } else {
      showControlsWithAnimation();
    }
  };

  const handleBack = () => {
    if (player && onProgressUpdate) {
      try {
        const time = player.currentTime || 0;
        const dur = player.duration || 0;
        if (dur > 0) {
          onProgressUpdate(time, dur);
        }
      } catch (e) {}
    }
    router.back();
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
    showControlsWithAnimation();
  };

  const handleSkipBackward = () => {
    if (player) {
      player.currentTime = Math.max(0, (player.currentTime || 0) - 10);
    }
    showControlsWithAnimation();
  };

  const handleSkipForward = () => {
    if (player && duration > 0) {
      player.currentTime = Math.min(duration, (player.currentTime || 0) + 10);
    }
    showControlsWithAnimation();
  };

  const handleFullscreen = async () => {
    if (videoViewRef.current) {
      setIsFullscreen(true);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      videoViewRef.current.enterFullscreen();
    }
  };

  const handleFullscreenEnter = () => {
    setIsFullscreen(true);
  };

  const handleFullscreenExit = async () => {
    setIsFullscreen(false);
    await ScreenOrientation.unlockAsync();
  };

  const handleEnterPiP = () => {
    if (!allowPiP || !videoUri) return;

    enterPiP({
      videoUri,
      title: title || 'Now Playing',
      channelName,
      thumbnailSource,
      isLive,
      currentTime: player?.currentTime || 0,
      videoId,
    });
    router.back();
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = isSeeking ? seekValue : currentTime;
  const progress = duration > 0 ? displayTime / duration : 0;

  // Handle progress bar press
  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progressBarWidth = dimensions.width - wp(24) - wp(80);
    const newProgress = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const newTime = newProgress * duration;
    
    if (player) {
      player.currentTime = newTime;
    }
    showControlsWithAnimation();
  };

  return (
    <View style={styles.container}>
      {videoUri ? (
        <>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={isFullscreen}
            fullscreenOptions={{
              enable: true,
              orientation: 'landscape',
            }}
            onFullscreenEnter={handleFullscreenEnter}
            onFullscreenExit={handleFullscreenExit}
          />

          {/* Tap area for showing/hiding controls */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleContainerPress} />

          {/* Loading Indicator - placed below controls so back button is accessible */}
          {isLoading && (
            <View style={styles.loadingContainer} pointerEvents="none">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}

          {/* Custom Controls Overlay - always show back button during loading */}
          {(showControls || isLoading) && (
            <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
              {/* Top Gradient */}
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent']}
                style={styles.topGradient}
              >
                <View style={styles.topControls}>
                  {showBackButton && (
                    <Pressable style={styles.iconButton} onPress={handleBack}>
                      <Ionicons name="chevron-back" size={wp(28)} color="#FFFFFF" />
                    </Pressable>
                  )}
                  <View style={styles.topRight}>
                    {allowPiP && (
                      <Pressable style={styles.iconButton} onPress={handleEnterPiP}>
                        <Ionicons name="albums-outline" size={wp(22)} color="#FFFFFF" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Title */}
                {title && (
                  <View style={styles.titleContainer}>
                    {isLive && <Badge label="LIVE" dotColor="#FF0000" />}
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                  </View>
                )}
              </LinearGradient>

              {/* Center Play/Pause Controls */}
              <View style={styles.centerControls}>
                {!isLive && (
                  <Pressable style={styles.skipButton} onPress={handleSkipBackward}>
                    <Ionicons name="play-back" size={wp(28)} color="#FFFFFF" />
                    <Text style={styles.skipText}>10</Text>
                  </Pressable>
                )}

                <Pressable style={styles.playButton} onPress={handlePlayPause}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={wp(40)}
                    color="#FFFFFF"
                  />
                </Pressable>

                {!isLive && (
                  <Pressable style={styles.skipButton} onPress={handleSkipForward}>
                    <Ionicons name="play-forward" size={wp(28)} color="#FFFFFF" />
                    <Text style={styles.skipText}>10</Text>
                  </Pressable>
                )}
              </View>

              {/* Bottom Gradient with Progress */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.bottomGradient}
              >
                {/* Progress Bar */}
                {!isLive && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>{formatTime(displayTime)}</Text>
                    
                    {/* Custom Progress Bar */}
                    <Pressable 
                      style={styles.progressBarContainer}
                      onPress={handleProgressBarPress}
                    >
                      <View style={styles.progressTrack}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${progress * 100}%` }
                          ]} 
                        />
                        <View 
                          style={[
                            styles.progressThumb,
                            { left: `${progress * 100}%` }
                          ]}
                        />
                      </View>
                    </Pressable>
                    
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                  </View>
                )}

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                  <View style={styles.bottomLeft}>
                    {channelName && (
                      <Text style={styles.channelName} numberOfLines={1}>{channelName}</Text>
                    )}
                  </View>
                  <View style={styles.bottomRight}>
                    <Pressable style={styles.iconButton} onPress={handleFullscreen}>
                      <Ionicons name="expand" size={wp(22)} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </>
      ) : (
        <>
          <Image
            source={thumbnailSource || require('@/assets/images/carusel-2.png')}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {showBackButton && (
            <Pressable style={styles.backButtonFallback} onPress={handleBack}>
              <Ionicons name="chevron-back" size={wp(28)} color="#FFFFFF" />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: dimensions.isTablet ? hp(330) : hp(240),
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topGradient: {
    paddingTop: hp(8),
    paddingHorizontal: wp(12),
    paddingBottom: hp(20),
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(8),
    gap: wp(8),
  },
  title: {
    fontSize: fs(16),
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
    flex: 1,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(40),
  },
  playButton: {
    width: wp(70),
    height: wp(70),
    borderRadius: wp(35),
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: fs(10),
    fontFamily: FONTS.medium,
    color: '#FFFFFF',
    marginTop: hp(-4),
  },
  bottomGradient: {
    paddingBottom: hp(12),
    paddingHorizontal: wp(12),
    paddingTop: hp(30),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(8),
  },
  progressBarContainer: {
    flex: 1,
    height: hp(30),
    justifyContent: 'center',
    marginHorizontal: wp(8),
  },
  progressTrack: {
    height: hp(4),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: hp(2),
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: hp(2),
  },
  progressThumb: {
    position: 'absolute',
    top: -hp(5),
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: '#2563EB',
    marginLeft: -wp(7),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  timeText: {
    fontSize: fs(12),
    fontFamily: FONTS.medium,
    color: '#FFFFFF',
    minWidth: wp(40),
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLeft: {
    flex: 1,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  channelName: {
    fontSize: fs(12),
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.8)',
  },
  iconButton: {
    width: wp(40),
    height: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFallback: {
    position: 'absolute',
    top: hp(12),
    left: wp(12),
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModernVideoPlayer;
