import apiClient from './client';
import type { AppNotification } from '../types';

export interface NotificationResponse {
  items: AppNotification[];
  unread_count: number;
}

export const notificationService = {
  async getNotifications(limit: number = 30): Promise<NotificationResponse> {
    const response = await apiClient.get('/notifications', { params: { limit } });
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data.unread_count;
  },

  async markAsRead(id: number): Promise<{ notification: AppNotification; unread_count: number }> {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<{ unread_count: number }> {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data.data;
  },

  async deleteNotification(id: number): Promise<{ unread_count: number }> {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data.data;
  },
};

export default notificationService;

