import api from './axios';

const notificationService = {
  getAll: () => api.get('/users/me/notifications').then(res => res.data),
  getUnreadCount: () => api.get('/users/me/notifications/unread-count').then(res => res.data.count),
  markAsRead: (id: string | number) => api.patch(`/users/me/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => api.patch('/users/me/notifications/read-all'),
};

export default notificationService;
