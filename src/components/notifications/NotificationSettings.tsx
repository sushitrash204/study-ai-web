'use client';

import React from 'react';
import { useNotificationPreferences } from '@/hooks/notifications/useNotificationPreferences';
import { NotificationType } from '@/types/notification';
import toast from 'react-hot-toast';

/**
 * NotificationSettings Component
 * Cài đặt thông báo - Bật/tắt từng loại
 */
export const NotificationSettings: React.FC = () => {
  const {
    preferences,
    loading,
    error,
    togglePreference,
    toggleAll,
    isTypeEnabled,
  } = useNotificationPreferences();

  // Nhóm các loại thông báo
  const notificationGroups = [
    {
      name: 'Nhóm học tập',
      icon: '👥',
      types: [
        NotificationType.GROUP_MEMBER_JOINED,
        NotificationType.GROUP_MEMBER_LEFT,
        NotificationType.GROUP_JOIN_REQUEST,
        NotificationType.GROUP_JOIN_ACCEPTED,
        NotificationType.GROUP_JOIN_REJECTED,
        NotificationType.GROUP_RESOURCE_SHARED,
        NotificationType.GROUP_RESULT_SHARED,
        NotificationType.GROUP_INVITATION,
      ],
    },
    {
      name: 'Bài tập',
      icon: '📝',
      types: [
        NotificationType.EXERCISE_READY,
        NotificationType.EXERCISE_GRADED,
        NotificationType.EXERCISE_LOW_SCORE,
        NotificationType.EXERCISE_ACHIEVEMENT,
      ],
    },
    {
      name: 'Tài liệu',
      icon: '📄',
      types: [
        NotificationType.DOCUMENT_READY,
        NotificationType.DOCUMENT_FAILED,
        NotificationType.DOCUMENT_SUMMARY_READY,
        NotificationType.DOCUMENT_SHARED,
      ],
    },
    {
      name: 'Chat & AI',
      icon: '🤖',
      types: [
        NotificationType.AI_RESPONSE_READY,
        NotificationType.CHAT_TIMEOUT,
      ],
    },
    {
      name: 'Hệ thống & Tài khoản',
      icon: '⚙️',
      types: [
        NotificationType.PASSWORD_CHANGED,
        NotificationType.PROFILE_UPDATED,
        NotificationType.NEW_SUBJECT_AVAILABLE,
        NotificationType.SYSTEM_ANNOUNCEMENT,
        NotificationType.WELCOME,
      ],
    },
  ];

  // Labels cho từng loại
  const typeLabels: Record<string, string> = {
    [NotificationType.GROUP_MEMBER_JOINED]: 'Thành viên mới tham gia nhóm',
    [NotificationType.GROUP_MEMBER_LEFT]: 'Thành viên rời nhóm',
    [NotificationType.GROUP_JOIN_REQUEST]: 'Có yêu cầu tham gia nhóm',
    [NotificationType.GROUP_JOIN_ACCEPTED]: 'Yêu cầu tham gia được chấp nhận',
    [NotificationType.GROUP_JOIN_REJECTED]: 'Yêu cầu tham gia bị từ chối',
    [NotificationType.GROUP_RESOURCE_SHARED]: 'Có người chia sẻ tài liệu',
    [NotificationType.GROUP_RESULT_SHARED]: 'Có người chia sẻ kết quả',
    [NotificationType.GROUP_INVITATION]: 'Nhận lời mời vào nhóm',
    [NotificationType.EXERCISE_READY]: 'Tạo bài tập thành công',
    [NotificationType.EXERCISE_GRADED]: 'Bài tập được chấm điểm',
    [NotificationType.EXERCISE_LOW_SCORE]: 'Cảnh báo điểm thấp',
    [NotificationType.EXERCISE_ACHIEVEMENT]: 'Đạt thành tích cao',
    [NotificationType.DOCUMENT_READY]: 'Upload tài liệu thành công',
    [NotificationType.DOCUMENT_FAILED]: 'Xử lý tài liệu thất bại',
    [NotificationType.DOCUMENT_SUMMARY_READY]: 'Tóm tắt tài liệu xong',
    [NotificationType.DOCUMENT_SHARED]: 'Có người chia sẻ tài liệu',
    [NotificationType.AI_RESPONSE_READY]: 'AI phản hồi xong',
    [NotificationType.CHAT_TIMEOUT]: 'Phiên chat hết giờ',
    [NotificationType.PASSWORD_CHANGED]: 'Đổi mật khẩu thành công',
    [NotificationType.PROFILE_UPDATED]: 'Cập nhật profile',
    [NotificationType.NEW_SUBJECT_AVAILABLE]: 'Có môn học hệ thống mới',
    [NotificationType.SYSTEM_ANNOUNCEMENT]: 'Thông báo hệ thống',
    [NotificationType.WELCOME]: 'Chào mừng người dùng mới',
  };

  const handleToggle = async (type: string, currentEnabled: boolean) => {
    try {
      await togglePreference(type, !currentEnabled);
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleToggleAll = async () => {
    const allEnabled = preferences.every(p => p.enabled);
    try {
      await toggleAll(!allEnabled);
      toast.success(allEnabled ? 'Đã tắt tất cả thông báo' : 'Đã bật tất cả thông báo');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-500">Đang tải cài đặt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Có lỗi xảy ra: {error}</p>
      </div>
    );
  }

  const allEnabled = preferences.every(p => p.enabled);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cài đặt thông báo</h2>
          <p className="text-sm text-gray-500 mt-1">
            Chọn loại thông báo bạn muốn nhận
          </p>
        </div>
        <button
          onClick={handleToggleAll}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            allEnabled
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {allEnabled ? 'Tắt tất cả' : 'Bật tất cả'}
        </button>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {notificationGroups.map((group) => (
          <div key={group.name} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Group Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span>{group.icon}</span>
                {group.name}
              </h3>
            </div>

            {/* Group Items */}
            <div className="divide-y divide-gray-100">
              {group.types.map((type) => {
                const pref = preferences.find(p => p.type === type);
                const enabled = pref?.enabled ?? true;

                return (
                  <div
                    key={type}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">
                      {typeLabels[type] || type}
                    </span>
                    <button
                      onClick={() => handleToggle(type, enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
