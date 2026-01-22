import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { usePiP } from '@/contexts/pip-context';
import { wp, hp, fs } from '@/utils/responsive';
import { FONTS } from '@/styles/global';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_PLAYER_WIDTH = wp(180);
const MINI_PLAYER_HEIGHT = hp(100);
const MARGIN = wp(12);

export function MiniPlayer() {
  const { isInPiP, pipData, exitPiP } = usePiP();
  
  // Use React Native's Animated API - all with useNativeDriver: false for consistency
  const pan = useRef(new Animated.ValueXY({
    x: SCREEN_WIDTH - MINI_PLAYER_WIDTH - MARGIN,
    y: SCREEN_HEIGHT - MINI_PLAYER_HEIGHT - hp(120),
  })).current;
  
  const scale = useRef(new Animated.Value(0)).current;
  const lastPosition = useRef({ x: 0, y: 0 });

  // Video player - create initially without a source
  const player = useVideoPlayer(null);

  // Listen to playing state
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // When entering PiP with a video URI, load and play the video
  useEffect(() => {
    if (player && pipData?.videoUri && isInPiP) {
      // Replace the video source and configure
      player.replace(pipData.videoUri);
      player.loop = pipData.isLive || false;
      
      // Set start time after a brief delay to ensure video is loaded
      setTimeout(() => {
        if (pipData.currentTime && pipData.currentTime > 0) {
          player.currentTime = pipData.currentTime;
        }
        player.play();
      }, 100);
    } else if (player && !isInPiP) {
      // Stop and clear when exiting PiP
      player.pause();
    }
  }, [pipData?.videoUri, isInPiP]);

  // Animate in/out - must use same native driver setting as pan
  useEffect(() => {
    Animated.timing(scale, {
      toValue: isInPiP ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isInPiP, scale]);

  // Create pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store current position
        lastPosition.current = {
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        };
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({
          x: lastPosition.current.x + gestureState.dx,
          y: lastPosition.current.y + gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentX = lastPosition.current.x + gestureState.dx;
        const currentY = lastPosition.current.y + gestureState.dy;
        
        // Snap to edges
        const snapX = currentX < SCREEN_WIDTH / 2 
          ? MARGIN 
          : SCREEN_WIDTH - MINI_PLAYER_WIDTH - MARGIN;
        
        // Keep Y within bounds
        const snapY = Math.max(
          hp(60),
          Math.min(currentY, SCREEN_HEIGHT - MINI_PLAYER_HEIGHT - hp(120))
        );

        // Animate to snap position
        Animated.timing(pan, {
          toValue: { x: snapX, y: snapY },
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const handlePlayPause = useCallback(() => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [player, isPlaying]);

  const handleClose = useCallback(() => {
    if (player) {
      player.pause();
    }
    exitPiP();
  }, [player, exitPiP]);

  const handleExpand = useCallback(() => {
    if (pipData?.videoId) {
      if (pipData.isLive) {
        router.push(`/live-video?id=${pipData.videoId}`);
      } else {
        router.push(`/video?id=${pipData.videoId}`);
      }
    }
    exitPiP();
  }, [pipData, exitPiP]);

  // Don't render if not in PiP mode
  if (!isInPiP || !pipData) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Video */}
      <View style={styles.videoContainer}>
        {pipData.videoUri && player ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
        ) : pipData.thumbnailSource ? (
          <Image source={pipData.thumbnailSource} style={styles.video} resizeMode="cover" />
        ) : (
          <View style={[styles.video, { backgroundColor: '#333' }]} />
        )}

        {/* Overlay Controls */}
        <View style={styles.overlay}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={wp(16)} color="#FFFFFF" />
          </Pressable>

          {/* Play/Pause Button */}
          <Pressable style={styles.playButton} onPress={handlePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={wp(20)}
              color="#FFFFFF"
            />
          </Pressable>

          {/* Expand Button */}
          <Pressable style={styles.expandButton} onPress={handleExpand}>
            <Ionicons name="expand" size={wp(16)} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Live Badge */}
        {pipData.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.title} numberOfLines={1}>
          {pipData.title}
        </Text>
        {pipData.channelName && (
          <Text style={styles.channelName} numberOfLines={1}>
            {pipData.channelName}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: MINI_PLAYER_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: wp(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  videoContainer: {
    width: '100%',
    height: MINI_PLAYER_HEIGHT,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  closeButton: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButton: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: wp(6),
    left: wp(6),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: wp(6),
    paddingVertical: wp(2),
    borderRadius: wp(4),
  },
  liveDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: '#FF0000',
    marginRight: wp(4),
  },
  liveText: {
    fontSize: fs(9),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  titleBar: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(8),
  },
  title: {
    fontSize: fs(11),
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
  channelName: {
    fontSize: fs(9),
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: wp(2),
  },
});

export default MiniPlayer;
