import { Comments } from '@/components/comments';
import { CommentsModal } from '@/components/uploaded-video/comments-modal';
import { ModernVideoPlayer } from '@/components/modern-video-player';
import { VideoRecommendationCard } from '@/components/video-recommendation-card';
import { styles } from '@/styles/live-video.styles';
import { dimensions, fs } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useRef } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useVodVideoDetails, 
  useVodVideos, 
  useToggleVodLike, 
  useVodLikeStatus,
  useWatchlistStatus,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useUpdateWatchHistory,
  useVodComments,
} from '@/hooks/queries/useVodQueries';
import { 
  useSubscriptionStatus, 
  useSubscribe, 
  useUnsubscribe 
} from '@/hooks/queries/useChannelQueries';
import { useToast } from '@/context/ToastContext';

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  // Fetch video details
  const { data: video, isLoading: isLoadingVideo, error } = useVodVideoDetails(id || '');
  const { data: likeStatus } = useVodLikeStatus(id || '');
  const { data: watchlistStatus } = useWatchlistStatus(id || '');
  const { data: recommendedVideos } = useVodVideos(1, 5);
  const { data: commentsData } = useVodComments(id || '', 1, 1); // Fetch just the first comment
  const toggleLikeMutation = useToggleVodLike();
  const addToWatchlistMutation = useAddToWatchlist();
  const removeFromWatchlistMutation = useRemoveFromWatchlist();
  const updateWatchHistoryMutation = useUpdateWatchHistory();
  
  // Track if we've already saved progress to avoid duplicate saves
  const lastSavedProgressRef = useRef<number>(0);

  // Get channel ID from video data
  const channelId = video?.channel?.id || video?.channelId;
  
  // Fetch channel subscription status
  const { data: subscriptionStatus } = useSubscriptionStatus(channelId);
  const subscribeMutation = useSubscribe();
  const unsubscribeMutation = useUnsubscribe();
  
  const isSubscribed = subscriptionStatus?.isSubscribed || false;
  const isSubscriptionLoading = subscribeMutation.isPending || unsubscribeMutation.isPending;

  // Format view count
  const formatViews = (count?: number): string => {
    if (!count) return '0 views';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k views`;
    return `${count} views`;
  };

  // Format time ago
  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleLike = () => {
    if (id) {
      toggleLikeMutation.mutate(id);
    }
  };

  const handleWatchlistToggle = () => {
    if (!id) return;
    
    // Use the toggle endpoint which handles both add and remove
    addToWatchlistMutation.mutate(id, {
      onSuccess: ({ inWatchlist }) => {
        if (inWatchlist) {
          showSuccess('Added to watchlist');
        } else {
          showSuccess('Removed from watchlist');
        }
      },
      onError: () => {
        showError('Failed to update watchlist');
      },
    });
  };

  const isWatchlistLoading = addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending;

  // Handle channel subscription toggle
  const handleSubscriptionToggle = useCallback(() => {
    if (!channelId || isSubscriptionLoading) return;
    
    if (isSubscribed) {
      unsubscribeMutation.mutate(channelId, {
        onSuccess: () => {
          showSuccess('Unsubscribed from channel');
        },
        onError: () => {
          showError('Failed to unsubscribe');
        },
      });
    } else {
      subscribeMutation.mutate(channelId, {
        onSuccess: () => {
          showSuccess('Subscribed to channel');
        },
        onError: () => {
          showError('Failed to subscribe');
        },
      });
    }
  }, [channelId, isSubscribed, isSubscriptionLoading, subscribeMutation, unsubscribeMutation, showSuccess, showError]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `https://rhapsodytv.live/video/${id}`;
      await Share.share({
        message: `Watch "${video?.title || 'Video'}" on Rhapsody TV!\n${shareUrl}`,
        url: shareUrl,
        title: video?.title || 'Video',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [id, video?.title]);

  // Handle channel press - navigate to channel profile
  const handleChannelPress = useCallback(() => {
    if (channelId) {
      router.push(`/channel-profile?id=${channelId}`);
    }
  }, [channelId]);

  // Handle video progress update for watch history
  const handleProgressUpdate = useCallback((currentTime: number, duration: number) => {
    if (!id || duration <= 0) return;
    
    // Only save if progress changed significantly (avoid duplicate API calls)
    const watchedSeconds = Math.floor(currentTime);
    if (Math.abs(watchedSeconds - lastSavedProgressRef.current) < 5) return;
    
    lastSavedProgressRef.current = watchedSeconds;
    
    updateWatchHistoryMutation.mutate({
      videoId: id,
      watchedSeconds,
      totalDurationSeconds: Math.floor(duration),
    });
  }, [id, updateWatchHistoryMutation]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    if (!id || !video?.durationSeconds) return;
    
    // Mark as completed by saving full duration
    updateWatchHistoryMutation.mutate({
      videoId: id,
      watchedSeconds: video.durationSeconds,
      totalDurationSeconds: video.durationSeconds,
    });
  }, [id, video?.durationSeconds, updateWatchHistoryMutation]);

  const handleVideoPress = (videoId: string) => {
    router.push(`/video?id=${videoId}`);
  };

  // Get filtered recommendations (exclude current video)
  const filteredRecommendations = recommendedVideos?.videos.filter(v => v.id !== id).slice(0, 4) || [];

  if (isLoadingVideo) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>Loading video...</Text>
      </SafeAreaView>
    );
  }

  if (error || !video) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <Text style={{ color: '#FFFFFF' }}>Failed to load video</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />

        {/* Modern Video Player with PiP */}
        <ModernVideoPlayer
          videoUri={video.playbackUrl}
          thumbnailSource={
            video.thumbnailUrl
              ? { uri: video.thumbnailUrl } as ImageSourcePropType
              : require('@/assets/images/Image-10.png') as ImageSourcePropType
          }
          title={video.title}
          channelName={video.channel?.name}
          onProgressUpdate={handleProgressUpdate}
          onVideoEnd={handleVideoEnd}
          videoId={id}
          isLive={false}
          allowPiP={true}
        />

        {isCommentsOpen ? (
          /* Comments View */
          <CommentsModal videoId={id || ''} onClose={() => setIsCommentsOpen(false)} />
        ) : (
          /* Regular Content */
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Video Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.videoTitle}>
                {video.title}
              </Text>

              <Pressable style={styles.channelInfo} onPress={handleChannelPress}>
                <Image
                  source={
                    video.channel?.logoUrl
                      ? { uri: video.channel.logoUrl }
                      : require('@/assets/images/Avatar.png')
                  }
                  style={styles.channelIcon}
                  resizeMode="contain"
                />
                <Text style={styles.channelName}>{video.channel?.name || 'Unknown Channel'}</Text>
                <View style={styles.viewCountContainer}>
                  <Ionicons name="eye-outline" size={dimensions.isTablet ? fs(18) : fs(16)} color="#737373" />
                  <Text style={styles.viewCount}>{formatViews(video.viewCount)}</Text>
                </View>
                <Text style={styles.startedTime}>{formatTimeAgo(video.publishedAt || video.createdAt)}</Text>
              </Pressable>

              {/* Action Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.actionButtons}
                style={styles.actionButtonsContainer}
              >
                <Pressable 
                  style={[
                    styles.subscribeButton,
                    isSubscribed && styles.subscribedButton
                  ]}
                  onPress={handleSubscriptionToggle}
                  disabled={isSubscriptionLoading || !channelId}
                >
                  <Text style={[
                    styles.subscribeButtonText,
                    isSubscribed && styles.subscribedButtonText
                  ]}>
                    {isSubscriptionLoading ? '...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={handleLike}>
                  <Ionicons 
                    name={likeStatus?.liked ? "thumbs-up" : "thumbs-up-outline"} 
                    size={dimensions.isTablet ? fs(16) : fs(14)} 
                    color={likeStatus?.liked ? "#2563EB" : "#000000"} 
                  />
                  <Text style={styles.actionButtonText}>{likeStatus?.likeCount || video.likeCount || 0}</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={dimensions.isTablet ? fs(16) : fs(14)} color="#000000" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                  <Ionicons name="download-outline" size={dimensions.isTablet ? fs(16) : fs(14)} color="#000000" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </Pressable>

                <Pressable 
                  style={styles.actionButton} 
                  onPress={handleWatchlistToggle}
                  disabled={isWatchlistLoading}
                >
                  <Ionicons 
                    name={watchlistStatus?.inWatchlist ? "bookmark" : "bookmark-outline"} 
                    size={dimensions.isTablet ? fs(16) : fs(14)} 
                    color={watchlistStatus?.inWatchlist ? "#2563EB" : "#000000"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    watchlistStatus?.inWatchlist && { color: '#2563EB' }
                  ]}>
                    {watchlistStatus?.inWatchlist ? 'Saved' : 'Save'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>

            {/* Comments Section */}
            <Comments 
              commentCount={video.commentCount || 0} 
              firstComment={
                commentsData?.comments?.[0] 
                  ? {
                      message: commentsData.comments[0].message,
                      user: {
                        fullName: commentsData.comments[0].user?.fullName || 'Anonymous',
                        avatar: undefined, // User avatar not available in comment response
                      },
                    }
                  : null
              }
              onPress={() => setIsCommentsOpen(true)} 
            />

            {/* Video Recommendations */}
            <View style={styles.recommendationsContainer}>
              {filteredRecommendations.map((recVideo) => (
                <VideoRecommendationCard
                  key={recVideo.id}
                  thumbnailSource={
                    recVideo.thumbnailUrl
                      ? { uri: recVideo.thumbnailUrl } as ImageSourcePropType
                      : require('@/assets/images/Image-2.png') as ImageSourcePropType
                  }
                  title={recVideo.title}
                  channelName={recVideo.channel?.name || 'Unknown Channel'}
                  channelAvatar={
                    recVideo.channel?.logoUrl
                      ? { uri: recVideo.channel.logoUrl } as ImageSourcePropType
                      : require('@/assets/images/Avatar.png') as ImageSourcePropType
                  }
                  viewCount={formatViews(recVideo.viewCount)}
                  timeAgo={formatTimeAgo(recVideo.publishedAt || recVideo.createdAt)}
                  isNew={true}
                  onPress={() => handleVideoPress(recVideo.id)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
