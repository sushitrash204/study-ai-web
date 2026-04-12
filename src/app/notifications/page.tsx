'use client';

import React from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">
            Xem và quản lý tất cả thông báo của bạn
          </p>
        </div>

        {/* Content */}
        <NotificationList />
      </div>
    </div>
  );
}
