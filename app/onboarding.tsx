import { Button } from '@/components/button';
import { styles } from '@/styles/onboarding.styles';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleSkip = () => {
    router.push('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Button
        onPress={handleSkip}
        style={styles.skipButton}
        textStyle={styles.skipButtonText}
      >
        Skip
      </Button>

      <Text style={styles.headlineText}>
        Watch, Connect{'\n'}& Grow with{'\n'}Rhapsody TV
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={styles.carouselImage.width + 16}
        snapToAlignment="center"
        decelerationRate="fast"
        style={styles.carouselContainer}
        contentContainerStyle={styles.carouselContent}
      >
        <Image
          source={require('@/assets/images/carusel-2.png')}
          style={styles.carouselImage}
          resizeMode="cover"
        />
        <Image
          source={require('@/assets/images/carusel-3.png')}
          style={styles.carouselImage}
          resizeMode="cover"
        />
        <Image
          source={require('@/assets/images/carusel-1.png')}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      </ScrollView>

      <Button
        onPress={handleSkip}
        style={styles.getStartedButton}
        textStyle={styles.getStartedButtonText}
      >
        Get Started
      </Button>
    </View>
  );
}
