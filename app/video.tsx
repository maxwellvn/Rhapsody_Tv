 
import { Comments } from '@/components/comments';
import { CommentsModal } from '@/components/uploaded-video/comments-modal';
import { UploadedVideoPlayer } from '@/components/uploaded-video/uploaded-video-player';
import { VideoRecommendationCard } from '@/components/video-recommendation-card';
import { styles } from '@/styles/live-video.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function VideoScreen() {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Uploaded Video Player - No Live badge, No cast button */}
        <UploadedVideoPlayer
          thumbnailSource={require('@/assets/images/Image-10.png')}
        />

        {isCommentsOpen ? (
          /* Comments View */
          <CommentsModal onClose={() => setIsCommentsOpen(false)} />
        ) : (
          /* Regular Content */
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
          {/* Video Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.videoTitle}>
              Your Loveworld Special with Pastor Chris Season 2 Phase 7
            </Text>

            <View style={styles.channelInfo}>
              <Image
                source={require('@/assets/images/Avatar.png')}
                style={styles.channelIcon}
                resizeMode="contain"
              />
              <Text style={styles.channelName}>Rhapsody TV</Text>
              <View style={styles.viewCountContainer}>
                <Ionicons name="eye-outline" size={16} color="#737373" />
                <Text style={styles.viewCount}>500k watching</Text>
              </View>
              <Text style={styles.startedTime}>Started 3hrs ago</Text>
            </View>

            {/* Action Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionButtons}
              style={styles.actionButtonsContainer}
            >
              <Pressable style={styles.subscribeButton}>
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Ionicons name="thumbs-up-outline" size={14} color="#000000" />
                <Text style={styles.actionButtonText}>Label</Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Ionicons name="gift-outline" size={14} color="#000000" />
                <Text style={styles.actionButtonText}>Sponsor</Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={14} color="#000000" />
                <Text style={styles.actionButtonText}>Share</Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Ionicons name="download-outline" size={14} color="#000000" />
                <Text style={styles.actionButtonText}>Download</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Comments Section */}
          <Comments commentCount={34} onPress={() => setIsCommentsOpen(true)} />

          {/* Video Recommendations */}
          <View style={styles.recommendationsContainer}>
            <VideoRecommendationCard
              thumbnailSource={require('@/assets/images/Image-2.png')}
              title="Night Of A Thousand Crusades HIGHLIGHT 3"
              channelName="Rhapsody TV"
              channelAvatar={require('@/assets/images/Avatar.png')}
              viewCount="500k views"
              timeAgo="3hrs ago"
              isNew={true}
            />
            
            <VideoRecommendationCard
              thumbnailSource={require('@/assets/images/Image-6.png')}
              title="NOTHING ON MEDIA IS NEUTRAL A CONVERSATION WITH BLOSSOM CH..."
              channelName="Program Highlights"
              channelAvatar={require('@/assets/images/Avatar.png')}
              viewCount="500k views"
              timeAgo="3hrs ago"
              isNew={true}
            />
          </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}
