/**
 * Common API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

/**
 * Authentication Types
 */

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isEmailVerified: boolean;
}

/**
 * Video Types
 */

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  uploadDate: string;
  category: string;
  tags: string[];
  channel: {
    id: string;
    name: string;
    avatar: string;
    isSubscribed: boolean;
  };
  streamUrl?: string;
  qualityOptions?: VideoQuality[];
}

export interface VideoQuality {
  quality: string;
  url: string;
  size?: number;
}

export interface VideoListParams {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
  search?: string;
}

/**
 * Channel Types
 */

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  isSubscribed: boolean;
  createdAt: string;
}

/**
 * Playlist Types
 */

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  videoCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  videos?: Video[];
}

export interface CreatePlaylistRequest {
  title: string;
  description?: string;
  isPublic: boolean;
}

/**
 * Comment Types
 */

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
  replyCount: number;
}

export interface CreateCommentRequest {
  videoId: string;
  content: string;
  parentId?: string;
}

/**
 * Notification Types
 */

export type NotificationType = 
  | 'new_video' 
  | 'new_livestream' 
  | 'comment_reply' 
  | 'video_like' 
  | 'new_subscriber' 
  | 'channel_update' 
  | 'program_reminder' 
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  thumbnail?: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
  // References for navigation
  videoId?: string;
  channelId?: string;
  programId?: string;
  livestreamId?: string;
  commentId?: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationSettings {
  subscriptions: boolean;
  recommendedVideos: boolean;
  comments: boolean;
  replies: boolean;
  mentions: boolean;
}

/**
 * Settings Types
 */

export interface UserSettings {
  general: {
    language: string;
    autoplay: boolean;
    restrictedMode: boolean;
  };
  video: {
    mobileQuality: 'auto' | 'higher' | 'data-saver';
    wifiQuality: 'auto' | 'higher' | 'data-saver';
    audioQuality: 'auto' | 'higher' | 'normal';
  };
  downloads: {
    quality: 'low' | 'medium' | 'high';
    wifiOnly: boolean;
  };
  notifications: NotificationSettings;
}

/**
 * History Types
 */

export interface WatchHistory {
  id: string;
  video: Video;
  watchedAt: string;
  progress: number; // Progress percentage (0-100)
  completed: boolean;
}

export interface SearchHistory {
  id: string;
  query: string;
  searchedAt: string;
}

/**
 * Homepage Types
 */

export interface LiveNowProgram {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  channel: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    coverImageUrl: string;
  };
  videoId: string;
  liveStreamId: string;
}

export interface ContinueWatchingItem {
  video: {
    id: string;
    title: string;
    description: string;
    playbackUrl: string;
    thumbnailUrl: string;
    durationSeconds: number;
    channel: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string;
      coverImageUrl: string;
    };
  };
  progressSeconds: number;
  durationSeconds: number;
}

export interface HomepageChannel {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  coverImageUrl: string;
}

/**
 * Schedule type for programs
 */
export type ScheduleType = 'daily' | 'weekly' | 'once';

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const;

export interface HomepageProgram {
  id: string;
  title: string;
  description?: string;
  scheduleType?: ScheduleType;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  durationInMinutes?: number;
  timezone?: string;
  isLive: boolean;
  thumbnailUrl?: string;
  playbackUrl?: string;
  viewerCount?: number;
  startedAt?: string;
  channel?: {
    id: string;
    name: string;
    slug?: string;
    logoUrl?: string;
    coverImageUrl?: string;
  };
  videoId?: string;
  livestreamId?: string;
  liveStreamId?: string;
}

export interface HomepageFeaturedVideo {
  id: string;
  title: string;
  description: string;
  playbackUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  channel: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    coverImageUrl: string;
  };
}

/**
 * VOD (Video on Demand) Types
 */

export interface VodVideo {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
  channel?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export interface VodPaginatedVideos {
  videos: VodVideo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VodComment {
  id: string;
  videoId: string;
  message: string;
  user: {
    id: string;
    fullName: string;
  };
  parentCommentId?: string;
  likeCount: number;
  createdAt: string;
  replies?: VodComment[];
}

export interface VodPaginatedComments {
  comments: VodComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LikeStatus {
  liked: boolean;
  likeCount: number;
}

/**
 * Schedule Types
 */

export interface ScheduleProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  scheduleType?: ScheduleType;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  daysOfWeek?: number[];
  startTime: string;
  endTime: string;
  durationInMinutes?: number;
  timezone?: string;
  category?: string;
  isLive: boolean;
  thumbnailUrl?: string;
  channel?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  livestreamId?: string;
}

/**
 * Channel Detail Types (for channel profile page)
 */

export interface ChannelDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  websiteUrl?: string;
  subscriberCount: number;
  videoCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Program Detail Types (for program profile page)
 */

export interface ProgramDetail {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  scheduleType?: ScheduleType;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  durationInMinutes?: number;
  timezone?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  subscriberCount?: number;
  videoCount?: number;
  channel?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

/**
 * Livestream Types
 */

export type LivestreamScheduleType = 'continuous' | 'scheduled';
export type LivestreamStatus = 'scheduled' | 'live' | 'ended' | 'canceled';

export interface Livestream {
  id: string;
  channelId: string;
  programId?: string;
  title: string;
  description?: string;
  scheduleType: LivestreamScheduleType;
  status: LivestreamStatus;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  startedAt?: string;
  endedAt?: string;
  thumbnailUrl?: string;
  playbackUrl?: string;
  rtmpUrl?: string;
  streamKey?: string;
  isChatEnabled: boolean;
  viewerCount?: number;
  createdAt: string;
  updatedAt: string;
  channel?: {
    id: string;
    name: string;
    slug?: string;
    logoUrl?: string;
  };
  program?: {
    id: string;
    name: string;
    slug?: string;
    thumbnailUrl?: string;
  };
}

export interface HomepageLivestream {
  id: string;
  title: string;
  description?: string;
  scheduleType: LivestreamScheduleType;
  status: LivestreamStatus;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  startedAt?: string;
  thumbnailUrl?: string;
  playbackUrl?: string;
  channel?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    coverImageUrl?: string;
  };
  program?: HomepageProgram;
}

/**
 * Chat Message Types (for WebSocket)
 */

export interface ChatMessage {
  id: string;
  livestreamId: string;
  userId: string;
  content: string;
  user: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

/**
 * Watch Progress Types
 */

export interface UpdateProgressRequest {
  videoId: string;
  progressSeconds: number;
  durationSeconds: number;
}

/**
 * Watchlist Types
 */

export interface WatchlistItem {
  id: string;
  videoId: string;
  video?: VodVideo;
  addedAt: string;
}

export interface PaginatedWatchlist {
  items: WatchlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WatchlistStatus {
  inWatchlist: boolean;
}

/**
 * Watch History Types (VOD)
 */

export interface WatchHistoryItem {
  id: string;
  videoId: string;
  video?: VodVideo;
  watchedSeconds: number;
  totalDurationSeconds: number;
  lastWatchedAt: string;
  completed: boolean;
}

export interface PaginatedWatchHistory {
  items: WatchHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateWatchHistoryRequest {
  watchedSeconds: number;
  totalDurationSeconds: number;
}
