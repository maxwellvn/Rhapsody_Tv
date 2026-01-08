import { FONTS } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type ChatMessage = {
  id: string;
  username: string;
  avatar: any;
  message: string;
};

type LiveChatModalProps = {
  onClose: () => void;
  viewerCount: string;
};

export function LiveChatModal({ onClose, viewerCount }: LiveChatModalProps) {
  const [message, setMessage] = useState('');

  // Sample chat messages
  const messages: ChatMessage[] = Array(10).fill(null).map((_, i) => ({
    id: `msg-${i}`,
    username: '@LuisSilva',
    avatar: require('@/assets/images/Avatar.png'),
    message: 'What a marvelous time in his presence. It is truly amazing',
  }));

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      console.log('Send message:', message);
      setMessage('');
    }
  };

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
          <Text style={styles.viewerCount}>{viewerCount}</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageItem}>
            <Image
              source={msg.avatar}
              style={styles.messageAvatar}
              resizeMode="contain"
            />
            <View style={styles.messageContent}>
              <Text style={styles.messageUsername}>{msg.username}</Text>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
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
            value={message}
            onChangeText={setMessage}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  viewerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewerCount: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#737373',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
  },
  messageUsername: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#000000',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#333333',
    lineHeight: 20,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
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
