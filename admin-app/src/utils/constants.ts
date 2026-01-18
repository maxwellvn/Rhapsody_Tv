/**
 * Application Constants
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Rhapsody TV Admin';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'rhapsody_admin_access_token',
  REFRESH_TOKEN: 'rhapsody_admin_refresh_token',
  USER_DATA: 'rhapsody_admin_user_data',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  CHANNELS: '/channels',
  VIDEOS: '/videos',
  PROGRAMS: '/programs',
  LIVESTREAMS: '/livestreams',
} as const;
