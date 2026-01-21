import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';
import { storage } from '@/utils/storage';

// WebSocket event names (must match backend)
const WS_EVENTS = {
  // Client -> Server
  JOIN_LIVESTREAM: 'joinLivestream',
  LEAVE_LIVESTREAM: 'leaveLivestream',
  SEND_COMMENT: 'sendComment',
  DELETE_COMMENT: 'deleteComment',

  // Server -> Client
  NEW_COMMENT: 'newComment',
  COMMENT_DELETED: 'commentDeleted',
  VIEWER_COUNT: 'viewerCount',
  COMMENT_HISTORY: 'commentHistory',
  USER_BANNED: 'userBanned',
  ERROR: 'error',
} as const;

// Types
export interface ChatComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface LivestreamChatCallbacks {
  onCommentHistory?: (comments: ChatComment[]) => void;
  onNewComment?: (comment: ChatComment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onViewerCount?: (count: number) => void;
  onError?: (error: string) => void;
  onBanned?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class LivestreamChatService {
  private socket: Socket | null = null;
  private callbacks: LivestreamChatCallbacks = {};
  private currentLivestreamId: string | null = null;
  private viewerTrackingDisabled: boolean = false;

  /**
   * Connect to the livestream chat WebSocket
   * @param callbacks - Event callbacks
   * @param options - Connection options
   * @param options.skipViewerTracking - If true, viewer count updates won't trigger callbacks
   *        (useful when parent component handles viewer tracking separately)
   */
  async connect(
    callbacks: LivestreamChatCallbacks,
    options?: { skipViewerTracking?: boolean }
  ): Promise<void> {
    if (this.socket?.connected) {
      console.log('[LivestreamChat] Already connected');
      return;
    }
    
    this.viewerTrackingDisabled = options?.skipViewerTracking ?? false;

    // Get auth token
    const token = await storage.getAccessToken();
    if (!token) {
      console.error('[LivestreamChat] No auth token available');
      callbacks.onError?.('Authentication required');
      return;
    }

    this.callbacks = callbacks;

    // Get base URL without /v1 for WebSocket connection
    const baseUrl = API_CONFIG.BASE_URL.replace('/v1', '');

    console.log('[LivestreamChat] Connecting to:', baseUrl);

    this.socket = io(`${baseUrl}/livestream`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[LivestreamChat] Connected');
      this.callbacks.onConnect?.();
      
      // Rejoin livestream if we were in one
      if (this.currentLivestreamId) {
        this.joinLivestream(this.currentLivestreamId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[LivestreamChat] Disconnected:', reason);
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[LivestreamChat] Connection error:', error.message);
      this.callbacks.onError?.('Connection failed');
    });

    // Comment history on join
    this.socket.on(WS_EVENTS.COMMENT_HISTORY, (data: { comments: ChatComment[] }) => {
      console.log('[LivestreamChat] Received comment history:', data.comments.length);
      this.callbacks.onCommentHistory?.(data.comments);
    });

    // New comment
    this.socket.on(WS_EVENTS.NEW_COMMENT, (comment: any) => {
      console.log('[LivestreamChat] New comment:', comment._id || comment.id);
      // Normalize _id to id for frontend
      const normalizedComment: ChatComment = {
        id: comment._id || comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user,
      };
      this.callbacks.onNewComment?.(normalizedComment);
    });

    // Comment deleted
    this.socket.on(WS_EVENTS.COMMENT_DELETED, (data: { commentId: string }) => {
      console.log('[LivestreamChat] Comment deleted:', data.commentId);
      this.callbacks.onCommentDeleted?.(data.commentId);
    });

    // Viewer count update (only if not disabled)
    this.socket.on(WS_EVENTS.VIEWER_COUNT, (data: { count: number }) => {
      console.log('[LivestreamChat] Viewer count:', data.count);
      if (!this.viewerTrackingDisabled) {
        this.callbacks.onViewerCount?.(data.count);
      }
    });

    // User banned
    this.socket.on(WS_EVENTS.USER_BANNED, () => {
      console.log('[LivestreamChat] User banned');
      this.callbacks.onBanned?.();
    });

    // Error
    this.socket.on(WS_EVENTS.ERROR, (data: { message: string }) => {
      console.error('[LivestreamChat] Error:', data.message);
      this.callbacks.onError?.(data.message);
    });
  }

  /**
   * Join a livestream chat room
   */
  joinLivestream(livestreamId: string): void {
    if (!this.socket?.connected) {
      console.error('[LivestreamChat] Not connected');
      return;
    }

    console.log('[LivestreamChat] Joining livestream:', livestreamId);
    this.currentLivestreamId = livestreamId;
    this.socket.emit(WS_EVENTS.JOIN_LIVESTREAM, { livestreamId });
  }

  /**
   * Leave a livestream chat room
   */
  leaveLivestream(livestreamId: string): void {
    if (!this.socket?.connected) return;

    console.log('[LivestreamChat] Leaving livestream:', livestreamId);
    this.socket.emit(WS_EVENTS.LEAVE_LIVESTREAM, { livestreamId });
    this.currentLivestreamId = null;
  }

  /**
   * Send a comment to the livestream
   */
  sendComment(livestreamId: string, content: string): void {
    if (!this.socket?.connected) {
      console.error('[LivestreamChat] Not connected');
      this.callbacks.onError?.('Not connected');
      return;
    }

    console.log('[LivestreamChat] Sending comment:', content);
    this.socket.emit(WS_EVENTS.SEND_COMMENT, { livestreamId, content });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[LivestreamChat] Disconnecting');
      if (this.currentLivestreamId) {
        this.leaveLivestream(this.currentLivestreamId);
      }
      this.socket.disconnect();
      this.socket = null;
    }
    this.callbacks = {};
    this.currentLivestreamId = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const livestreamChatService = new LivestreamChatService();
