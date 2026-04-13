import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { isSocketConnected } from '../../services/notificationSocket';

/**
 * Hook để quản lý socket connection cho notifications
 */
export const useNotificationSocket = (userId: string | null) => {
  const socketConnected = useNotificationStore(state => state.socketConnected);
  const [error, setError] = useState<string | null>(null);

  // Check connection status
  const isConnected = isSocketConnected() && socketConnected;

  return {
    connected: isConnected,
    error,
  };
};
