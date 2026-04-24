import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/api$/, '');
  }

  const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configuredApiBase) {
    return configuredApiBase.replace(/\/api$/, '');
  }

  const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '3000';

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${backendPort}`;
  }

  return `http://localhost:${backendPort}`;
};

const SOCKET_URL = getSocketUrl();

interface SocketMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  type: 'TEXT' | 'DOCUMENT' | 'EXERCISE';
  resourceId?: string;
  createdAt: string;
}

interface ConnectionStatus {
  connected: boolean;
  loading: boolean;
  error?: string;
}

interface UseGroupSocketOptions {
  groupId: string;
  userId: string;
  onNewMessage?: (message: SocketMessage) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onUserTyping?: (data: any) => void;
}

export const useGroupSocket = (options: UseGroupSocketOptions) => {
  const {
    groupId,
    userId,
    onNewMessage,
    onUserJoined,
    onUserLeft,
    onUserTyping,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    loading: true,
  });
  const [activeUsers, setActiveUsers] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    try {
      const token = localStorage?.getItem('token') || sessionStorage?.getItem('token');
      
      const socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setStatus({ connected: true, loading: false });

        // Join group room
        socket.emit('client:join_group', {
          groupId,
          userId,
        });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setStatus({ connected: false, loading: false, error: 'Disconnected' });
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        setStatus({
          connected: false,
          loading: false,
          error: error.message || 'Connection error',
        });
      });

      // Message events
      socket.on('server:new_message', (message: SocketMessage) => {
        onNewMessage?.(message);
      });

      socket.on('server:user_joined', (data: any) => {
        setActiveUsers(data.activeUsers || 0);
        onUserJoined?.(data);
      });

      socket.on('server:user_left', (data: any) => {
        setActiveUsers(data.activeUsers || 0);
        onUserLeft?.(data);
      });

      socket.on('server:user_typing', (data: any) => {
        onUserTyping?.(data);
      });

      socket.on('server:active_users', (data: any) => {
        setActiveUsers(data.count || 0);
      });

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
        setStatus({
          connected: status.connected,
          loading: false,
          error: error.message || 'Socket error',
        });
      });

      return () => {
        if (socket) {
          socket.emit('client:leave_group', { groupId, userId });
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setStatus({
        connected: false,
        loading: false,
        error: String(error),
      });
    }
  }, [groupId, userId]);

  // Send message
  const sendMessage = useCallback(
    (
      content: string,
      type: 'TEXT' | 'DOCUMENT' | 'EXERCISE' | 'RESULT' = 'TEXT',
      resourceId?: string,
      replyToMessageId?: string
    ) => {
      if (!socketRef.current?.connected) {
        console.warn('Socket not connected');
        return;
      }

      socketRef.current.emit('client:send_message', {
        groupId,
        userId,
        content,
        type,
        resourceId,
        replyToMessageId,
      });
    },
    [groupId, userId]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current?.connected) return;

      socketRef.current.emit('client:typing', {
        groupId,
        userId,
        isTyping,
      });
    },
    [groupId, userId]
  );

  // Get active users
  const getActiveUsers = useCallback(() => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('client:get_active_users', { groupId });
  }, [groupId]);

  return {
    socket: socketRef.current,
    status,
    activeUsers,
    sendMessage,
    sendTyping,
    getActiveUsers,
  };
};
