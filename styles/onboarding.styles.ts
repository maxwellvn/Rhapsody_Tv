import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0000FF',
  },
  skipButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0000FF',
    borderColor: '#FAFAFA',
    borderWidth: 1,
    borderRadius: 12,
  },
  skipButtonText: {
    color: '#FAFAFA',
    fontWeight: '500',
    fontSize: 14,
  },
  headlineText: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
  },
  carouselContainer: {
    position: 'absolute',
    top: 320,
    left: 0,
    right: 0,
    height: 340,
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  carouselImage: {
    width: width - 80,
    height: 300,
    marginHorizontal: 8,
    borderRadius: 20,
  },
  getStartedButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#0000FF',
    fontWeight: '600',
    fontSize: 16,
  },
});
