'use client';

import React from 'react';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cài đặt thông báo
          </h1>
          <p className="text-gray-600">
            Tùy chỉnh loại thông báo bạn muốn nhận
          </p>
        </div>

        {/* Content */}
        <NotificationSettings />
      </div>
    </div>
  );
}
