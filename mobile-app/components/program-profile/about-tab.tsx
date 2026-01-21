import { FONTS } from '@/styles/global';
import { fs, hp, spacing, wp } from '@/utils/responsive';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ProgramDetail } from '@/types/api.types';

type AboutTabProps = {
  program?: ProgramDetail;
};

export function AboutTab({ program }: AboutTabProps) {
  const description = program?.description || 'No description available for this program.';
  const channelName = program?.channel?.name || 'Unknown Channel';
  const subscriberCount = program?.subscriberCount 
    ? formatCount(program.subscriberCount) + ' subscribers' 
    : '0 subscribers';

  function formatCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  }

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

        {/* Channel */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/Icons/Home.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoText}>Channel: {channelName}</Text>
        </View>

        {/* Category */}
        {program?.category && (
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Image
                source={require('@/assets/Icons/info.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.infoText}>Category: {program.category}</Text>
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
          <Text style={styles.infoText}>{subscriberCount}</Text>
        </View>

        {/* Video Count */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/Icons/Discover.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoText}>{program?.videoCount || 0} videos</Text>
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
