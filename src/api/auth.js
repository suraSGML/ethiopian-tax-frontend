import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  getTaxProfile: () => api.get('/auth/profile/tax/'),
  updateTaxProfile: (data) => api.patch('/auth/profile/tax/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  requestPasswordReset: (email) => api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (data) => api.post('/auth/password-reset/confirm/', data),
  // Admin
  listUsers: (params) => api.get('/auth/users/', { params }),
  getUser: (id) => api.get(`/auth/users/${id}/`),
  toggleUserActive: (id) => api.post(`/auth/users/${id}/toggle_active/`),
  verifyUser: (id) => api.post(`/auth/users/${id}/verify/`),
};
