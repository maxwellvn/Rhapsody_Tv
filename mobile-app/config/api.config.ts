/**
 * API Configuration
 * Update the BASE_URL with your actual backend URL when ready
 */

export const API_CONFIG = {
  // Backend API base URL - Production server
  BASE_URL: 'http://iow4kgks8c0ssgs04kwgs04w.102.219.189.97.sslip.io/v1',
  
  // Timeout duration in milliseconds
  TIMEOUT: 30000,
  
  // API version
  VERSION: 'v1',
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    REQUEST_EMAIL_VERIFICATION: '/auth/email/request-verification',
    VERIFY_EMAIL: '/auth/email/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // User
  USER: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    UPLOAD_AVATAR: '/user/avatar',
    PREFERENCES: '/user/preferences',
  },
  
  // Videos
  VIDEOS: {
    LIST: '/videos',
    TRENDING: '/videos/trending',
    RECOMMENDED: '/videos/recommended',
    SEARCH: '/videos/search',
    DETAILS: (id: string) => `/videos/${id}`,
    RELATED: (id: string) => `/videos/${id}/related`,
    STREAM: (id: string) => `/videos/${id}/stream`,
  },
  
  // Channels
  CHANNELS: {
    LIST: '/channels',
    DETAILS: (id: string) => `/channels/${id}`,
    BY_SLUG: (slug: string) => `/channels/slug/${slug}`,
    // Note: Videos endpoint doesn't exist - use VOD.LIST and filter by channelId
    SUBSCRIBE: (id: string) => `/channels/${id}/subscribe`,
    UNSUBSCRIBE: (id: string) => `/channels/${id}/unsubscribe`,
    SUBSCRIPTIONS: '/channels/subscriptions',
    SUBSCRIPTION_STATUS: (id: string) => `/channels/${id}/subscription-status`,
  },
  
  // Playlists
  PLAYLISTS: {
    LIST: '/playlists',
    DETAILS: (id: string) => `/playlists/${id}`,
    CREATE: '/playlists',
    UPDATE: (id: string) => `/playlists/${id}`,
    DELETE: (id: string) => `/playlists/${id}`,
    ADD_VIDEO: (id: string) => `/playlists/${id}/videos`,
  },
  
  // Interactions
  INTERACTIONS: {
    LIKE: (videoId: string) => `/videos/${videoId}/like`,
    UNLIKE: (videoId: string) => `/videos/${videoId}/unlike`,
    COMMENT: (videoId: string) => `/videos/${videoId}/comments`,
    DELETE_COMMENT: (commentId: string) => `/comments/${commentId}`,
    VIEW: (videoId: string) => `/videos/${videoId}/view`,
  },
  
  // History (uses VOD endpoints)
  HISTORY: {
    LIST: '/vod/history',
    UPDATE: (videoId: string) => `/vod/${videoId}/history`,
    REMOVE: (videoId: string) => `/vod/${videoId}/history`,
    CLEAR: '/vod/history',
  },

  // Watchlist (uses VOD endpoints)
  WATCHLIST: {
    LIST: '/vod/watchlist',
    ADD: (videoId: string) => `/vod/${videoId}/watchlist`,
    REMOVE: (videoId: string) => `/vod/${videoId}/watchlist`,
    STATUS: (videoId: string) => `/vod/${videoId}/watchlist-status`,
  },
  
  // Downloads
  DOWNLOADS: {
    LIST: '/downloads',
    START: '/downloads/start',
    DELETE: (id: string) => `/downloads/${id}`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
    UPDATE_SETTINGS: '/notifications/settings/update',
    REGISTER_TOKEN: '/notifications/register-token',
    UNREGISTER_TOKEN: '/notifications/unregister-token',
  },
  
  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings/update',
  },
  
  // Homepage
  HOMEPAGE: {
    LIVE_NOW: '/homepage/live-now',
    CONTINUE_WATCHING: '/homepage/continue-watching',
    CHANNELS: '/homepage/channels',
    PROGRAMS: '/homepage/programs',
    FEATURED_VIDEOS: '/homepage/featured-videos',
    PROGRAM_HIGHLIGHTS: '/homepage/program-highlights',
    LIVESTREAMS: '/homepage/livestreams',
    UPDATE_PROGRESS: '/homepage/update-progress',
    WATCH_LIVESTREAM: (id: string) => `/homepage/watch-livestream/${id}`,
  },

  // Livestreams (public endpoints)
  LIVESTREAMS: {
    LIST: '/livestreams',
    LIVE_NOW: '/livestreams/live',
    UPCOMING: '/livestreams/upcoming',
    BY_CHANNEL: (channelId: string) => `/livestreams/channel/${channelId}`,
    BY_PROGRAM: (programId: string) => `/livestreams/program/${programId}`,
    DETAILS: (id: string) => `/livestreams/${id}`,
    STATS: (id: string) => `/livestreams/${id}/stats`,
    LIKE: (id: string) => `/livestreams/${id}/like`,
    LIKE_STATUS: (id: string) => `/livestreams/${id}/like-status`,
    TRACK_WATCH: (id: string) => `/livestreams/${id}/watch`,
    WATCH_HISTORY: '/livestreams/history/list',
  },

  // VOD (Video on Demand)
  VOD: {
    LIST: '/vod',
    FEATURED: '/vod/featured',
    LATEST: '/vod/latest',
    DETAILS: (id: string) => `/vod/${id}`,
    LIKE: (id: string) => `/vod/${id}/like`,
    LIKE_STATUS: (id: string) => `/vod/${id}/like-status`,
    COMMENTS: (id: string) => `/vod/${id}/comments`,
    REPLY: (videoId: string, commentId: string) => `/vod/${videoId}/comments/${commentId}/reply`,
    DELETE_COMMENT: (commentId: string) => `/vod/comments/${commentId}`,
    LIKE_COMMENT: (commentId: string) => `/vod/comments/${commentId}/like`,
    COMMENT_LIKE_STATUS: (commentId: string) => `/vod/comments/${commentId}/like-status`,
  },

  // Schedule - Note: No dedicated schedule endpoint exists in backend
  // Schedule data comes from programs with startTime/endTime
  SCHEDULE: {
    // These endpoints don't exist - using homepage/programs instead
    LIST: '/homepage/programs',
    BY_DATE: (date: string) => `/homepage/programs?date=${date}`,
    BY_CHANNEL: (channelId: string) => `/homepage/programs?channelId=${channelId}`,
  },

  // Programs (public endpoints)
  PROGRAMS: {
    LIST: '/programs',
    DETAILS: (id: string) => `/programs/${id}`,
    SUBSCRIBE: (id: string) => `/programs/${id}/subscribe`,
    UNSUBSCRIBE: (id: string) => `/programs/${id}/unsubscribe`,
    SUBSCRIPTIONS: '/programs/subscriptions',
    SUBSCRIPTION_STATUS: (id: string) => `/programs/${id}/subscription-status`,
  },
} as const;
