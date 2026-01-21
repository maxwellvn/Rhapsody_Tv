import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';
import { storage } from '@/utils/storage';

// WebSocket events for viewer tracking
const WS_EVENTS = {
  JOIN_LIVESTREAM: 'joinLivestream',
  LEAVE_LIVESTREAM: 'leaveLivestream',
  VIEWER_COUNT: 'viewerCount',
  ERROR: 'error',
} as const;

interface UseLivestreamViewerResult {
  viewerCount: number | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * Hook to connect to livestream WebSocket for viewer tracking
 * This ensures viewers are counted even when they don't open the chat
 */
export function useLivestreamViewer(livestreamId: string | undefined): UseLivestreamViewerResult {
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!livestreamId) {
      return;
    }

    let mounted = true;

    const connect = async () => {
      // Get auth token
      const token = await storage.getAccessToken();
      if (!token) {
        console.log('[LivestreamViewer] No auth token, skipping viewer tracking');
        return;
      }

      // Get base URL without /v1 for WebSocket connection
      const baseUrl = API_CONFIG.BASE_URL.replace('/v1', '');

      console.log('[LivestreamViewer] Connecting to:', baseUrl);

      const socket = io(`${baseUrl}/livestream`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        if (!mounted) return;
        console.log('[LivestreamViewer] Connected');
        setIsConnected(true);
        setError(null);

        // Join the livestream room for viewer counting
        if (!hasJoinedRef.current) {
          console.log('[LivestreamViewer] Joining livestream:', livestreamId);
          socket.emit(WS_EVENTS.JOIN_LIVESTREAM, { livestreamId });
          hasJoinedRef.current = true;
        }
      });

      socket.on('disconnect', (reason) => {
        if (!mounted) return;
        console.log('[LivestreamViewer] Disconnected:', reason);
        setIsConnected(false);
        hasJoinedRef.current = false;
      });

      socket.on('connect_error', (err) => {
        if (!mounted) return;
        console.error('[LivestreamViewer] Connection error:', err.message);
        setError('Connection failed');
      });

      socket.on(WS_EVENTS.VIEWER_COUNT, (data: { count: number }) => {
        if (!mounted) return;
        console.log('[LivestreamViewer] Viewer count update:', data.count);
        setViewerCount(data.count);
      });

      socket.on(WS_EVENTS.ERROR, (data: { message: string }) => {
        if (!mounted) return;
        console.error('[LivestreamViewer] Error:', data.message);
        // Don't set error for chat-related issues, we're just tracking viewers
      });
    };

    connect();

    // Cleanup on unmount or livestreamId change
    return () => {
      mounted = false;
      if (socketRef.current) {
        if (hasJoinedRef.current && livestreamId) {
          console.log('[LivestreamViewer] Leaving livestream:', livestreamId);
          socketRef.current.emit(WS_EVENTS.LEAVE_LIVESTREAM, { livestreamId });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasJoinedRef.current = false;
    };
  }, [livestreamId]);

  return { viewerCount, isConnected, error };
}
