'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore(state => state.initialize);
  const user = useAuthStore(state => state.user);
  
  const { initializeSocket, fetchUnreadCount, disconnectSocket } = useNotificationStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user) {
      // Khởi tạo socket và lấy số thông báo chưa đọc khi đã login
      initializeSocket(user.id);
      fetchUnreadCount();
      
      return () => {
        disconnectSocket();
      };
    }
  }, [user, initializeSocket, fetchUnreadCount, disconnectSocket]);

  return <>{children}</>;
}
