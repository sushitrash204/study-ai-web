'use client';

import React from 'react';
import { useNotifications } from '@/hooks';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@/types/notification';
import toast from 'react-hot-toast';

/**
 * NotificationList Component
 * Danh sách thông báo với filter, pagination
 */
export const NotificationList: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    pagination,
    filters,
    loadMore,
    filterByReadStatus,
    filterByType,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications({ page: 1, limit: 20 });

  // Filter tabs
  const filterTabs = [
    { label: 'Tất cả', value: 'all', action: () => { filterByReadStatus(undefined); filterByType(undefined); } },
    { label: 'Chưa đọc', value: 'unread', action: () => filterByReadStatus(false) },
    { label: 'Quan trọng', value: 'group', action: () => filterByType(NotificationType.GROUP_JOIN_REQUEST) },
  ];

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast.success('Đã đánh dấu đã đọc');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    
    try {
      await deleteNotification(id);
      toast.success('Đã xóa thông báo');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!confirm('Đánh dấu tất cả thông báo đã đọc?')) return;
    
    try {
      await markAllAsRead();
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Có lỗi xảy ra: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={tab.action}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (tab.value === 'all' && !filters.read && !filters.type) ||
                (tab.value === 'unread' && filters.read === false) ||
                (tab.value === filters.type)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mark All As Read */}
        {pagination.total > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        Tổng: {pagination.total} thông báo
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-500">Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-lg font-medium">Không có thông báo nào</p>
            <p className="text-sm mt-1">Thông báo của bạn sẽ hiện ở đây</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div key={notification.id} className="group">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              </div>
            ))}

            {/* Load More */}
            {pagination.page < pagination.totalPages && (
              <div className="p-4 text-center border-t border-gray-100">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
