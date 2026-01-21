import { Button } from '@/components/button';
import { styles } from '@/styles/schedule-program-card.styles';
import { Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';
import { ScheduleBadge } from './schedule-badge';

type ScheduleProgramCardProps = {
  time: string;
  duration: string;
  category: string;
  title: string;
  description: string;
  watchingCount: string;
  isLive?: boolean;
  thumbnailUrl?: string;
  onPress?: () => void;
  onWatchNowPress?: () => void;
};

export function ScheduleProgramCard({
  time,
  duration,
  category,
  title,
  description,
  watchingCount,
  isLive = false,
  thumbnailUrl,
  onPress,
  onWatchNowPress,
}: ScheduleProgramCardProps) {
  const thumbnailSource: ImageSourcePropType = thumbnailUrl
    ? { uri: thumbnailUrl }
    : require('@/assets/images/Image-4.png');
  return (
    <Pressable 
      style={[styles.container, isLive && styles.containerLive]} 
      onPress={onPress}
    >
      {/* Thumbnail */}
      <Image
        source={thumbnailSource}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Top Row: Time and Live Badge */}
      <View style={styles.topRow}>
        <View style={styles.timeSection}>
          <Text style={styles.time}>{time}</Text>
          <View style={styles.durationRow}>
            <Image
              source={require('@/assets/Icons/clock.png')}
              style={styles.clockIcon}
              resizeMode="contain"
            />
            <Text style={styles.duration}>{duration}</Text>
          </View>
        </View>
        
        {isLive && <ScheduleBadge label="Live" isLive={isLive} />}
      </View>

      {/* Category */}
      <View style={styles.categoryRow}>
        <Image
          source={require('@/assets/Icons/globe.png')}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
        <Text style={styles.category}>{category}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>{description}</Text>

      {/* Bottom Row: Watching, Watch Now Button */}
      <View style={styles.bottomRow}>
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.watchingText}>{watchingCount} watching</Text>
          </View>
        </View>

        <Button 
          style={styles.watchButton}
          textStyle={styles.watchButtonText}
          onPress={onWatchNowPress}
        >
          Watch Now
        </Button>
      </View>
    </Pressable>
  );
}
