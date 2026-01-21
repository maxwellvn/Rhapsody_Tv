import { LiveChat } from '@/components/live-video/live-chat';
import { LiveChatModal } from '@/components/live-video/live-chat-modal';
import { VideoPlayer } from '@/components/video-player';
import { VideoRecommendationCard } from '@/components/video-recommendation-card';
import { styles } from '@/styles/live-video.styles';
import { dimensions, fs } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/utils/storage';
import { 
  useLivestream, 
  useLivestreamStats,
  useLivestreamLikeStatus,
  useToggleLivestreamLike,
} from '@/hooks/queries/useHomepageQueries';
import { useVodVideos } from '@/hooks/queries/useVodQueries';
import { 
  useSubscriptionStatus, 
  useSubscribe, 
  useUnsubscribe 
} from '@/hooks/queries/useChannelQueries';

export default function LiveVideoScreen() {
  const { id, videoId } = useLocalSearchParams<{ id?: string; videoId?: string }>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | undefined>();

  // Load user info for chat
  useEffect(() => {
    const loadUser = async () => {
      const userData = await storage.getUserData<{ fullName?: string; avatar?: string }>();
      if (userData) {
        setUserName(userData.fullName || '');
        setUserAvatar(userData.avatar);
      }
    };
    loadUser();
  }, []);

  // Fetch livestream details
  const { data: livestream, isLoading, error } = useLivestream(id || '');
  const { data: recommendedVideos } = useVodVideos(1, 5);
  
  // Get channel ID from livestream data
  const channelId = livestream?.channel?.id;
  
  // Fetch channel subscription status
  const { data: subscriptionStatus } = useSubscriptionStatus(channelId);
  const subscribeMutation = useSubscribe();
  const unsubscribeMutation = useUnsubscribe();
  
  const isSubscribed = subscriptionStatus?.isSubscribed || false;
  const isSubscriptionLoading = subscribeMutation.isPending || unsubscribeMutation.isPending;

  // Fetch livestream stats (polls every 10 seconds for real-time updates)
  const { data: statsData } = useLivestreamStats(id || '');
  
  // Fetch like status
  const { data: likeStatus } = useLivestreamLikeStatus(id || '');
  const toggleLikeMutation = useToggleLivestreamLike();
  
  const isLiked = likeStatus?.liked || false;
  const likeCount = statsData?.likeCount || likeStatus?.likeCount || 0;
  const viewerCount = statsData?.viewerCount || livestream?.viewerCount || 0;

  // Format view count
  const formatViews = (count?: number): string => {
    if (!count) return '0 watching';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M watching`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k watching`;
    return `${count} watching`;
  };

  // Format time ago
  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Started just now';
    if (diffHours === 1) return 'Started 1hr ago';
    return `Started ${diffHours}hrs ago`;
  };

  const handleVideoPress = (recVideoId: string) => {
    router.push(`/video?id=${recVideoId}`);
  };

  // Handle channel subscription toggle
  const handleSubscriptionToggle = useCallback(() => {
    if (!channelId || isSubscriptionLoading) return;
    
    if (isSubscribed) {
      unsubscribeMutation.mutate(channelId);
    } else {
      subscribeMutation.mutate(channelId);
    }
  }, [channelId, isSubscribed, isSubscriptionLoading, subscribeMutation, unsubscribeMutation]);

  // Handle like toggle
  const handleLikeToggle = useCallback(() => {
    if (!id || toggleLikeMutation.isPending) return;
    toggleLikeMutation.mutate(id);
  }, [id, toggleLikeMutation]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `https://rhapsodytv.live/live/${id}`;
      await Share.share({
        message: `Watch "${livestream?.title || 'Live Stream'}" live on Rhapsody TV!\n${shareUrl}`,
        url: shareUrl,
        title: livestream?.title || 'Live Stream',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [id, livestream?.title]);

  // Handle channel press - navigate to channel profile
  const handleChannelPress = useCallback(() => {
    if (channelId) {
      router.push(`/channel-profile?id=${channelId}`);
    }
  }, [channelId]);

  // Get filtered recommendations
  const filteredRecommendations = recommendedVideos?.videos.slice(0, 4) || [];

  // Use livestream playbackUrl if available, otherwise fallback to default
  const streamUrl = livestream?.playbackUrl 
    || 'https://2nbyjxnbl53k-hls-live.5centscdn.com/RTV/59a49be6dc0f146c57cd9ee54da323b1.sdp/playlist.m3u8';

  if (isLoading && id) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ color: '#FFFFFF', marginTop: 16 }}>Loading livestream...</Text>
      </SafeAreaView>
    );
  }

  // For now, show a fallback stream even if there's an error (for demo purposes)
  const displayData = livestream || {
    title: 'Live Stream',
    description: '',
    isLive: true,
    channel: { name: 'Rhapsody TV', logoUrl: null, coverImageUrl: null },
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />

        {/* Video Player - Always Visible */}
        <VideoPlayer
          videoUri={streamUrl}
          thumbnailSource={
            displayData.channel?.coverImageUrl
              ? { uri: displayData.channel.coverImageUrl } as ImageSourcePropType
              : require('@/assets/images/carusel-2.png') as ImageSourcePropType
          }
          isLive={true}
        />

        {isChatOpen ? (
          /* Live Chat View */
          <LiveChatModal
            livestreamId={id || ''}
            onClose={() => setIsChatOpen(false)}
            viewerCount={formatViews(0)}
          />
        ) : (
          /* Regular Content */
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Video Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.videoTitle}>
                {displayData.title}
              </Text>

              <Pressable style={styles.channelInfo} onPress={handleChannelPress}>
                <Image
                  source={
                    displayData.channel?.logoUrl
                      ? { uri: displayData.channel.logoUrl }
                      : require('@/assets/images/Avatar.png')
                  }
                  style={styles.channelIcon}
                  resizeMode="contain"
                />
                <Text style={styles.channelName}>{displayData.channel?.name || 'Rhapsody TV'}</Text>
                <View style={styles.viewCountContainer}>
                  <Ionicons name="eye-outline" size={dimensions.isTablet ? fs(18) : fs(16)} color="#737373" />
                  <Text style={styles.viewCount}>{formatViews(viewerCount)}</Text>
                </View>
                <Text style={styles.startedTime}>{formatTimeAgo(livestream?.startedAt || livestream?.startTime)}</Text>
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

                <Pressable 
                  style={styles.actionButton} 
                  onPress={handleLikeToggle}
                  disabled={toggleLikeMutation.isPending}
                >
                  <Ionicons 
                    name={isLiked ? "thumbs-up" : "thumbs-up-outline"} 
                    size={dimensions.isTablet ? fs(16) : fs(14)} 
                    color={isLiked ? "#2563EB" : "#000000"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    isLiked && { color: '#2563EB' }
                  ]}>
                    {likeCount > 0 ? likeCount : 'Like'}
                  </Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                  <Ionicons name="gift-outline" size={dimensions.isTablet ? fs(16) : fs(14)} color="#000000" />
                  <Text style={styles.actionButtonText}>Sponsor</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={dimensions.isTablet ? fs(16) : fs(14)} color="#000000" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </Pressable>
              </ScrollView>
            </View>

            {/* Live Chat Section */}
            <LiveChat 
              onPress={() => setIsChatOpen(true)} 
              userName={userName}
              userAvatar={userAvatar}
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
                  viewCount={`${recVideo.viewCount} views`}
                  timeAgo=""
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
