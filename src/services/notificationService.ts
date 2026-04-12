import api from './api';
import { Notification, NotificationPreference, NotificationsResponse, UnreadCountResponse, PreferencesResponse, UpdatePreferencesPayload, NotificationFilters } from '../types/notification';

// Logic lấy API_URL có thể không cần nữa nếu đã có trong ./api, 
// nhưng giữ lại các type import và dùng 'api' thay cho local axios.

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


/**
 * Lấy danh sách thông báo (phân trang, lọc)
 */
export const getNotifications = async (
  filters: NotificationFilters = {}
): Promise<NotificationsResponse> => {
  const { page = 1, limit = 20, read, type } = filters;
  
  const params: any = { page, limit };
  if (read !== undefined) params.read = read;
  if (type) params.type = type;

  const response = await api.get<ApiResponse<NotificationsResponse>>('/notifications', { params });
  return response.data.data;
};

/**
 * Lấy số lượng thông báo chưa đọc
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<ApiResponse<UnreadCountResponse>>('/notifications/unread-count');
  return response.data.data.count;
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 */
export const markAllAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

/**
 * Xóa thông báo
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

/**
 * Lấy cài đặt thông báo
 */
export const getPreferences = async (): Promise<NotificationPreference[]> => {
  const response = await api.get<ApiResponse<PreferencesResponse>>('/notifications/preferences');
  return response.data.data.preferences;
};

/**
 * Cập nhật cài đặt thông báo
 */
export const updatePreferences = async (
  preferences: UpdatePreferencesPayload['preferences']
): Promise<NotificationPreference[]> => {
  const response = await api.put<ApiResponse<PreferencesResponse>>('/notifications/preferences', {
    preferences,
  });
  return response.data.data.preferences;
};
