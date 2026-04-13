'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore(state => state.initialize);
  const user = useAuthStore(state => state.user);
  
  const initializeSocket = useNotificationStore(state => state.initializeSocket);
  const fetchUnreadCount = useNotificationStore(state => state.fetchUnreadCount);
  const disconnectSocket = useNotificationStore(state => state.disconnectSocket);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user?.id) {
      // Khởi tạo socket và lấy số thông báo chưa đọc khi đã login
      initializeSocket(user.id);
      fetchUnreadCount();
      
      return () => {
        disconnectSocket();
      };
    }
  }, [user?.id, initializeSocket, fetchUnreadCount, disconnectSocket]);

  return <>{children}</>;
}
