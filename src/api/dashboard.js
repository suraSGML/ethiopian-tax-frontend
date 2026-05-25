import api from './axios';

export const dashboardAPI = {
  taxpayerDashboard: () => api.get('/core/dashboard/taxpayer/'),
  adminDashboard: () => api.get('/core/dashboard/admin/'),
  revenueReport: (year) => api.get('/core/reports/revenue/', { params: { year } }),
  notifications: (params) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/unread_count/'),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
  auditLogs: (params) => api.get('/audit/logs/', { params }),
  fraudAlerts: (params) => api.get('/audit/fraud-alerts/', { params }),
  resolveAlert: (id, data) => api.post(`/audit/fraud-alerts/${id}/resolve/`, data),
};
