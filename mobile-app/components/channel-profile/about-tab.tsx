import { FONTS } from '@/styles/global';
import { fs, hp, spacing, wp } from '@/utils/responsive';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChannelDetail } from '@/types/api.types';

type AboutTabProps = {
  channel?: ChannelDetail;
};

export function AboutTab({ channel }: AboutTabProps) {
  const description = channel?.description || 'No description available';
  const website = channel?.websiteUrl || '';
  const subscriberCount = channel?.subscriberCount || 0;
  const createdAt = channel?.createdAt;

  // Format subscriber count
  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k subscribers`;
    return `${count} subscribers`;
  };

  // Format joined date
  const formatJoinedDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const handleWebsitePress = () => {
    if (website) {
      Linking.openURL(website).catch((err) => console.error('Failed to open URL:', err));
    }
  };

  return (
    <View style={styles.container}>
      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>

      {/* More Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More info</Text>

        {/* Website */}
        {website && (
          <Pressable onPress={handleWebsitePress} style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Image
                source={require('@/assets/Icons/globe.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.linkText}>{website}</Text>
          </Pressable>
        )}

        {/* Joined Date */}
        {createdAt && (
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Image
                source={require('@/assets/Icons/info.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.infoText}>{formatJoinedDate(createdAt)}</Text>
          </View>
        )}

        {/* Subscriber Count */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/Icons/persons.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoText}>{formatCount(subscriberCount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: hp(32),
  },
  sectionTitle: {
    fontSize: fs(20),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginBottom: hp(12),
  },
  descriptionText: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#737373',
    lineHeight: fs(22),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(16),
  },
  iconContainer: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  linkText: {
    fontSize: fs(14),
    fontFamily: FONTS.medium,
    color: '#0000FF',
    flex: 1,
  },
  infoText: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#737373',
    flex: 1,
  },
  icon: {
    width: wp(24),
    height: wp(24),
    tintColor: '#737373',
  },
});
