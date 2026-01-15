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
  confirmPassword: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Notification {
  id: string;
  type: 'video_upload' | 'comment' | 'like' | 'subscription' | 'system';
  title: string;
  message: string;
  thumbnail?: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
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
