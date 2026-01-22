import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const KINGSCHAT_CONFIG = {
  clientId: 'com.kingschat',
  authUrl: 'https://accounts.kingsch.at',
  apiUrl: 'https://connect.kingsch.at',
  scopes: ['kingschat', 'profile'],
  // Web callback that will receive POST from KingsChat and redirect to app
  webCallbackBase: 'https://iow4kgks8c0ssgs04kwgs04w.102.219.189.97.sslip.io',
};

export interface KingsChatTokenResponse {
  accessToken: string;
  expiresInMillis: number;
  refreshToken: string;
}

export interface KingsChatUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  email?: string;
}

class KingsChatService {
  private appRedirectUri: string;

  constructor() {
    // App deep link URI for final redirect
    this.appRedirectUri = Linking.createURL('kingschat-callback');
  }

  /**
   * Initiate KingsChat OAuth login flow
   * Uses a web intermediary to handle POST redirect from KingsChat
   */
  async login(): Promise<KingsChatTokenResponse> {
    try {
      const authUrl = this.buildAuthUrl();
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.appRedirectUri,
        {
          showInRecents: true,
          preferEphemeralSession: false,
        }
      );

      if (result.type === 'success' && 'url' in result && result.url) {
        const tokens = this.parseCallbackUrl(result.url);
        return tokens;
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Login cancelled by user');
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('KingsChat login error:', error);
      throw error;
    }
  }

  /**
   * Build the OAuth authorization URL
   * KingsChat uses POST redirect, so we need a web intermediary
   */
  private buildAuthUrl(): string {
    // Scopes must be formatted as JSON array string: ["scope1", "scope2"]
    const scopesString = JSON.stringify(KINGSCHAT_CONFIG.scopes);
    
    // Web callback URL that will receive the POST and redirect to app
    const webCallbackUrl = `${KINGSCHAT_CONFIG.webCallbackBase}/v1/auth/kingschat/callback?app_redirect=${encodeURIComponent(this.appRedirectUri)}`;
    
    const params = new URLSearchParams({
      client_id: KINGSCHAT_CONFIG.clientId,
      scopes: scopesString,
      redirect_uri: webCallbackUrl,
      response_type: 'token',
      post_redirect: 'true',
    });

    return `${KINGSCHAT_CONFIG.authUrl}?${params.toString()}`;
  }

  /**
   * Parse the callback URL to extract tokens
   * Tokens will be in query params after redirect from web callback
   */
  private parseCallbackUrl(url: string): KingsChatTokenResponse {
    let params: Record<string, string> = {};
    
    // Check for fragment (after #)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const fragment = url.substring(hashIndex + 1);
      const fragmentParams = new URLSearchParams(fragment);
      fragmentParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    // Also check query params (after ?)
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const endIndex = hashIndex !== -1 ? hashIndex : url.length;
      const queryString = url.substring(queryIndex + 1, endIndex);
      const queryParams = new URLSearchParams(queryString);
      queryParams.forEach((value, key) => {
        if (!params[key]) {
          params[key] = value;
        }
      });
    }

    // Also try Linking.parse as fallback
    const parsedUrl = Linking.parse(url);
    if (parsedUrl.queryParams) {
      Object.entries(parsedUrl.queryParams).forEach(([key, value]) => {
        if (!params[key] && value) {
          params[key] = value as string;
        }
      });
    }

    if (params.error) {
      throw new Error(params.error);
    }

    const accessToken = params.access_token || params.accessToken;
    const refreshToken = params.refresh_token || params.refreshToken;
    const expiresIn = params.expires_in_millis || params.expires_in || params.expiresInMillis;

    if (!accessToken) {
      throw new Error('No access token received from KingsChat');
    }

    return {
      accessToken,
      refreshToken: refreshToken || '',
      expiresInMillis: expiresIn ? parseInt(expiresIn, 10) : 3600000,
    };
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<KingsChatTokenResponse> {
    try {
      const response = await fetch(`${KINGSCHAT_CONFIG.apiUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: KINGSCHAT_CONFIG.clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresInMillis: data.expires_in_millis,
      };
    } catch (error) {
      console.error('KingsChat token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get user profile from KingsChat
   */
  async getUserProfile(accessToken: string): Promise<KingsChatUserProfile> {
    try {
      const response = await fetch(`${KINGSCHAT_CONFIG.apiUrl}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();

      return {
        id: data.id || data.userId,
        username: data.username,
        displayName: data.displayName || data.display_name || data.name,
        avatar: data.avatar || data.profilePicture || data.profile_picture,
        email: data.email,
      };
    } catch (error) {
      console.error('KingsChat get profile error:', error);
      throw error;
    }
  }
}

export const kingsChatService = new KingsChatService();
