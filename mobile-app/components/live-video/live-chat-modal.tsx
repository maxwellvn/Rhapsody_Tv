import { styles } from '@/styles/live-chat-modal.styles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/utils/storage';
import {
  livestreamChatService,
  ChatComment,
} from '@/services/livestream-chat.service';

type LiveChatModalProps = {
  livestreamId?: string;
  onClose: () => void;
  viewerCount: string;
};

export function LiveChatModal({ livestreamId, onClose, viewerCount }: LiveChatModalProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<ChatComment[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveViewerCount, setLiveViewerCount] = useState<number | null>(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Check for token on mount (don't rely solely on isAuthenticated)
  useEffect(() => {
    const checkToken = async () => {
      const token = await storage.getAccessToken();
      console.log('[LiveChat] Token check:', token ? 'Token found' : 'No token');
      setHasToken(!!token);
    };
    checkToken();
  }, []);

  // Connect to WebSocket on mount
  useEffect(() => {
    console.log('[LiveChat] Effect triggered - hasToken:', hasToken, 'livestreamId:', livestreamId);
    
    // Wait for token check to complete
    if (hasToken === null) {
      console.log('[LiveChat] Waiting for token check...');
      return;
    }

    if (!livestreamId) {
      console.log('[LiveChat] No livestream ID');
      setError('No livestream ID provided');
      setIsConnecting(false);
      return;
    }

    if (!hasToken) {
      console.log('[LiveChat] No token, showing login message');
      setError('Please log in to join the chat');
      setIsConnecting(false);
      return;
    }

    console.log('[LiveChat] Connecting to chat...');
    connectToChat();

    // Cleanup on unmount
    return () => {
      livestreamChatService.disconnect();
    };
  }, [livestreamId, hasToken]);

  const connectToChat = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Connect with skipViewerTracking since the parent LiveVideoScreen handles
      // viewer tracking via useLivestreamViewer hook
      await livestreamChatService.connect({
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          // Join the livestream room after connecting
          if (livestreamId) {
            livestreamChatService.joinLivestream(livestreamId);
          }
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        onCommentHistory: (historyComments) => {
          // Sort by date ascending (oldest first) so newest are at bottom
          const sorted = [...historyComments].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setComments(sorted);
          // Scroll to bottom after receiving history
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
        },
        onNewComment: (comment) => {
          setComments((prev) => [...prev, comment]);
          // Scroll to bottom when new comment arrives
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        onCommentDeleted: (commentId) => {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        },
        onViewerCount: (count) => {
          setLiveViewerCount(count);
        },
        onError: (errorMsg) => {
          setError(errorMsg);
          setIsConnecting(false);
        },
        onBanned: () => {
          setError('You have been banned from this chat');
        },
      }, { skipViewerTracking: true });
    } catch (err) {
      console.error('Failed to connect to chat:', err);
      setError('Failed to connect to chat');
      setIsConnecting(false);
    }
  };

  const handleSend = useCallback(() => {
    if (!message.trim() || !livestreamId || !isConnected) return;

    livestreamChatService.sendComment(livestreamId, message.trim());
    setMessage('');
  }, [message, livestreamId, isConnected]);

  // Format username from user data
  const formatUsername = (commentUser: ChatComment['user']) => {
    if (commentUser.fullName) {
      // Remove spaces and add @ prefix
      return `@${commentUser.fullName.replace(/\s/g, '')}`;
    }
    return '@User';
  };

  // Get display viewer count (prefer live count from WebSocket)
  const displayViewerCount = liveViewerCount !== null 
    ? liveViewerCount.toLocaleString() 
    : viewerCount;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Live Chat</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000000" />
          </Pressable>
        </View>
        <View style={styles.viewerCountContainer}>
          <Ionicons name="eye-outline" size={16} color="#737373" />
          <Text style={styles.viewerCount}>{displayViewerCount}</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isConnecting && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#0000FF" />
            <Text style={styles.statusText}>Connecting to chat...</Text>
          </View>
        )}

        {error && (
          <View style={styles.statusContainer}>
            <Ionicons name="warning-outline" size={24} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            {hasToken && (
              <Pressable onPress={connectToChat} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            )}
          </View>
        )}

        {!isConnecting && !error && comments.length === 0 && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>No messages yet. Be the first to chat!</Text>
          </View>
        )}

        {comments.map((comment, index) => (
          <View key={comment.id || `comment-${index}`} style={styles.messageItem}>
            {comment.user.avatar ? (
              <Image
                source={{ uri: comment.user.avatar }}
                style={styles.messageAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.messageAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {comment.user.fullName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.messageContent}>
              <Text style={styles.messageUsername}>{formatUsername(comment.user)}</Text>
              <Text style={styles.messageText}>{comment.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        {user ? (
          <View style={[styles.inputAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user.fullName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        ) : (
          <Image
            source={require('@/assets/images/Avatar.png')}
            style={styles.inputAvatar}
            resizeMode="contain"
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={isConnected ? "Add a comment..." : "Connecting..."}
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={isConnected && !!hasToken}
          />
          <Pressable 
            onPress={handleSend} 
            style={[
              styles.sendButton,
              (!isConnected || !message.trim()) && styles.sendButtonDisabled
            ]}
            disabled={!isConnected || !message.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={isConnected && message.trim() ? "#0000FF" : "#CCC"} 
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
