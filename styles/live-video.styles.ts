import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  channelIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Inter_500Medium',
    marginRight: 8,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  viewCount: {
    fontSize: 14,
    color: '#737373',
    fontFamily: 'Inter_400Regular',
  },
  startedTime: {
    fontSize: 14,
    color: '#737373',
    fontFamily: 'Inter_400Regular',
  },
  actionButtonsContainer: {
    flexGrow: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  subscribeButton: {
    backgroundColor: '#0000FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F0F0F',
    fontFamily: 'Inter_500Medium',
  },
  recommendationsContainer: {
    padding: 16,
  },
});
