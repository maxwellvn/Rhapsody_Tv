import { FONTS } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useVodComments, useAddVodComment, useToggleCommentLike } from '@/hooks/queries/useVodQueries';

type CommentsModalProps = {
  videoId: string;
  onClose: () => void;
};

export function CommentsModal({ videoId, onClose }: CommentsModalProps) {
  const [activeTab, setActiveTab] = useState<'Top' | 'Newest'>('Top');
  const [comment, setComment] = useState('');

  const { data: commentsData, isLoading, error } = useVodComments(videoId, 1, 50);
  const addCommentMutation = useAddVodComment();
  const toggleLikeMutation = useToggleCommentLike();

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const handleSend = () => {
    if (comment.trim() && videoId) {
      addCommentMutation.mutate(
        { videoId, message: comment.trim() },
        {
          onSuccess: () => {
            setComment('');
          },
        }
      );
    }
  };

  const handleLikeComment = (commentId: string) => {
    toggleLikeMutation.mutate({ videoId, commentId });
  };

  const comments = commentsData?.comments || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comments</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000000" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'Top' && styles.activeTab]}
          onPress={() => setActiveTab('Top')}
        >
          <Text style={[styles.tabText, activeTab === 'Top' && styles.activeTabText]}>
            Top
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'Newest' && styles.activeTab]}
          onPress={() => setActiveTab('Newest')}
        >
          <Text style={[styles.tabText, activeTab === 'Newest' && styles.activeTabText]}>
            Newest
          </Text>
        </Pressable>
      </View>

      {/* Comments List */}
      <ScrollView
        style={styles.commentsContainer}
        contentContainerStyle={styles.commentsContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}

        {error && !isLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Failed to load comments</Text>
          </View>
        )}

        {!isLoading && !error && comments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
          </View>
        )}

        {!isLoading && !error && comments.map((commentItem) => (
          <View key={commentItem.id}>
            <View style={styles.commentItem}>
              <Image
                source={require('@/assets/images/Avatar.png')}
                style={styles.commentAvatar}
                resizeMode="contain"
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>@{commentItem.user?.fullName || 'Anonymous'}</Text>
                  <Text style={styles.commentTime}>· {formatTimeAgo(commentItem.createdAt)}</Text>
                  <Pressable style={styles.menuButton}>
                    <Ionicons name="ellipsis-vertical" size={16} color="#666666" />
                  </Pressable>
                </View>
                <Text style={styles.commentText}>{commentItem.message}</Text>
                
                {/* Actions */}
                <View style={styles.commentActions}>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => handleLikeComment(commentItem.id)}
                  >
                    <Ionicons name="thumbs-up-outline" size={16} color="#666666" />
                    <Text style={styles.actionText}>{commentItem.likeCount || 0}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                    <Text style={styles.actionText}>{commentItem.replies?.length || 0}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Replies indicator */}
            {commentItem.replies && commentItem.replies.length > 0 && (
              <Pressable style={styles.repliesIndicator}>
                <Image
                  source={require('@/assets/images/Avatar.png')}
                  style={styles.replyAvatar}
                  resizeMode="contain"
                />
                <Text style={styles.repliesText}>· {commentItem.replies.length} replies</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <Image
          source={require('@/assets/images/Avatar.png')}
          style={styles.inputAvatar}
          resizeMode="contain"
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#0000FF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#0000FF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  commentsContainer: {
    flex: 1,
  },
  commentsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#000000',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666666',
    marginLeft: 4,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666666',
  },
  repliesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 52,
    marginTop: -8,
    marginBottom: 16,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  repliesText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#0000FF',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666666',
    textAlign: 'center',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  inputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#000000',
    maxHeight: 100,
  },
  sendButton: {
    padding: 4,
    marginLeft: 8,
  },
});
