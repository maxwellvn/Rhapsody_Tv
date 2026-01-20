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

/**
 * Channels list response (matches GET /admin/channels)
 */
export interface ChannelsListResponse {
  channels: Channel[];
  total: number;
  pages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Authentication Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isEmailVerified: boolean;
}

/**
 * Channel Types
 */
export interface Channel {
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

export interface CreateChannelRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

export interface UpdateChannelRequest extends Partial<CreateChannelRequest> {}

/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: ('user' | 'admin')[];
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  roles?: ('user' | 'admin')[];
}

export interface UpdateUserRequest {
  fullName?: string;
  roles?: ('user' | 'admin')[];
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  pages: number;
}

/**
 * Video Types
 */
export interface Video {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  visibility: 'public' | 'unlisted' | 'private';
  viewCount: number;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoRequest {
  channelId: string;
  title: string;
  description?: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  visibility?: 'public' | 'unlisted' | 'private';
  isActive?: boolean;
}

export interface UpdateVideoRequest extends Partial<CreateVideoRequest> {}

export interface VideosListResponse {
  videos: Video[];
  total: number;
  pages: number;
}

/**
 * Program Types
 */
export interface Program {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  durationInMinutes?: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramRequest {
  channelId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category?: string;
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {}

export interface ProgramsListResponse {
  programs: Program[];
  total: number;
  pages: number;
}

/**
 * Livestream Types
 */
export interface Livestream {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'canceled';
  scheduledStartAt?: string;
  startedAt?: string;
  endedAt?: string;
  thumbnailUrl?: string;
  playbackUrl?: string;
  rtmpUrl?: string;
  streamKey?: string;
  isChatEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLivestreamRequest {
  channelId: string;
  title: string;
  description?: string;
  scheduledStartAt?: string;
  thumbnailUrl?: string;
  isChatEnabled?: boolean;
}

export interface UpdateLivestreamRequest {
  title?: string;
  description?: string;
  scheduledStartAt?: string;
  thumbnailUrl?: string;
  isChatEnabled?: boolean;
}

export interface UpdateLivestreamStatusRequest {
  status: 'scheduled' | 'live' | 'ended' | 'canceled';
}

export interface LivestreamsListResponse {
  livestreams: Livestream[];
  total: number;
  pages: number;
}

/**
 * Upload Types
 */
export interface UploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size: number;
  contentType: string;
}

export interface UploadFromUrlRequest {
  url: string;
}
