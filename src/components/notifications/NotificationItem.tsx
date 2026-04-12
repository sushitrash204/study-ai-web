'use client';

import React from 'react';
import { Notification } from '@/types/notification';
import { NotificationModel } from '@/models/Notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

/**
 * NotificationItem Component
 * Hiển thị một thông báo đơn lẻ
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const model = new NotificationModel(notification);
  const priority = model.getPriority();
  const color = model.getColor();
  const icon = model.getIcon();

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
    onClick?.(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${
        !notification.read ? 'bg-blue-50' : 'bg-white'
      } hover:bg-gray-50`}
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm ${
              !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            }`}>
              {notification.title}
            </h4>
            
            {/* Unread indicator */}
            {!notification.read && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: color }}
              ></span>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            {/* Time & Priority */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {model.formatTime()}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {priority === 'HIGH' ? 'Quan trọng' : priority === 'MEDIUM' ? 'Thông báo' : 'Thấp'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.(notification.id);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
