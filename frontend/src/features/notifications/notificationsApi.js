import apiClient from '../../services/apiClient';

export const notificationsApi = {
  getNotifications: (params = {}) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  clearAll: () => apiClient.delete('/notifications/clear-all'),
};

export default notificationsApi;

