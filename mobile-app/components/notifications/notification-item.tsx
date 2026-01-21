import { FONTS } from '@/styles/global';
import { borderRadius, fs, hp, spacing, wp } from '@/utils/responsive';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

type NotificationItemProps = {
  avatar?: ImageSourcePropType | string;
  title: string;
  subtitle: string;
  timeAgo: string;
  thumbnail?: ImageSourcePropType | string;
  isRead?: boolean;
  onPress?: () => void;
  onMenuPress?: () => void;
};

// Default placeholder images
const DEFAULT_AVATAR = require('@/assets/images/Avatar.png');
const DEFAULT_THUMBNAIL = require('@/assets/images/Image-11.png');

export function NotificationItem({
  avatar,
  title,
  subtitle,
  timeAgo,
  thumbnail,
  isRead = true,
  onPress,
  onMenuPress,
}: NotificationItemProps) {
  // Handle both ImageSourcePropType and string URLs
  const avatarSource = typeof avatar === 'string' 
    ? { uri: avatar } 
    : (avatar || DEFAULT_AVATAR);
  
  const thumbnailSource = typeof thumbnail === 'string'
    ? { uri: thumbnail }
    : (thumbnail || DEFAULT_THUMBNAIL);

  return (
    <Pressable 
      style={[styles.container, !isRead && styles.unreadContainer]} 
      onPress={onPress}
    >
      {/* Unread indicator */}
      {!isRead && <View style={styles.unreadDot} />}

      {/* Avatar */}
      <Image
        source={avatarSource}
        style={styles.avatar}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, !isRead && styles.unreadTitle]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>

      {/* Thumbnail */}
      <Image
        source={thumbnailSource}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Menu Button */}
      <Pressable onPress={onMenuPress} style={styles.menuButton} hitSlop={8}>
        <Image
          source={require('@/assets/Icons/ellipsis.png')}
          style={styles.menuIcon}
          resizeMode="contain"
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: hp(12),
    gap: wp(12),
    backgroundColor: '#FFFFFF',
  },
  unreadContainer: {
    backgroundColor: '#F0F7FF',
  },
  unreadDot: {
    position: 'absolute',
    left: wp(8),
    top: '50%',
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#2563EB',
    marginTop: -wp(4),
  },
  avatar: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(28),
  },
  content: {
    flex: 1,
    gap: hp(4),
  },
  title: {
    fontSize: fs(15),
    fontFamily: FONTS.medium,
    color: '#000000',
  },
  unreadTitle: {
    fontFamily: FONTS.semibold,
  },
  subtitle: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#737373',
  },
  timeAgo: {
    fontSize: fs(13),
    fontFamily: FONTS.regular,
    color: '#999999',
  },
  thumbnail: {
    width: wp(100),
    height: wp(56),
    borderRadius: borderRadius.md,
  },
  menuButton: {
    padding: wp(4),
  },
  menuIcon: {
    width: wp(20),
    height: wp(20),
    tintColor: '#737373',
    transform: [{ rotate: '90deg' }],
  },
});
