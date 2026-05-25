import api from './axios';

export const paymentsAPI = {
  list: (params) => api.get('/payments/', { params }),
  get: (id) => api.get(`/payments/${id}/`),
  initiate: (data) => api.post('/payments/initiate/', data),
  getReceipt: (id) => api.get(`/payments/${id}/receipt/`),
  getReceiptPdf: (id) => api.get(`/payments/${id}/receipt_pdf/`, { responseType: 'blob' }),
  refund: (id, data) => api.post(`/payments/${id}/refund/`, data),
  revenueSummary: () => api.get('/payments/revenue_summary/'),
};
