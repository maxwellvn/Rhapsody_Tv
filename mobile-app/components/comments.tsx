import { FONTS } from '@/styles/global';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FirstComment = {
  message: string;
  user: {
    fullName: string;
    avatar?: string;
  };
};

type CommentsProps = {
  commentCount: number;
  firstComment?: FirstComment | null;
  onPress?: () => void;
};

export function Comments({ commentCount, firstComment, onPress }: CommentsProps) {
  const hasComments = commentCount > 0 && firstComment;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments</Text>
        <Text style={styles.count}>{commentCount}</Text>
      </View>

      {hasComments ? (
        <View style={styles.commentItem}>
          <Image
            source={
              firstComment.user.avatar 
                ? { uri: firstComment.user.avatar } as ImageSourcePropType
                : require('@/assets/images/Avatar.png') as ImageSourcePropType
            }
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.commentContent}>
            <Text style={styles.userName}>{firstComment.user.fullName}</Text>
            <Text style={styles.commentText} numberOfLines={2}>
              {firstComment.message}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#737373" />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={24} color="#A0A0A0" />
          <Text style={styles.emptyText}>
            {commentCount === 0 ? 'No comments yet. Be the first to comment!' : 'Tap to view comments'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#000000',
  },
  count: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#737373',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#000000',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#000000',
    lineHeight: 20,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#737373',
  },
});
