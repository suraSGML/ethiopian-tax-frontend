import api from './axios';

export const taxFilingAPI = {
  // ── Filings CRUD ──────────────────────────────────────────
  list:   (params) => api.get('/tax/filings/', { params }),
  get:    (id)     => api.get(`/tax/filings/${id}/`),
  create: (data)   => api.post('/tax/filings/', data),
  update: (id, data) => api.patch(`/tax/filings/${id}/`, data),
  delete: (id)     => api.delete(`/tax/filings/${id}/`),

  // ── Workflow actions ──────────────────────────────────────
  submit:  (id)        => api.post(`/tax/filings/${id}/submit/`),
  review:  (id, data)  => api.post(`/tax/filings/${id}/review/`, data),
  appeal:  (id, data)  => api.post(`/tax/filings/${id}/appeal/`, data),
  amend:   (id, data)  => api.post(`/tax/filings/${id}/amend/`, data),
  resolveAppeal: (id, data) => api.post(`/tax/filings/${id}/resolve_appeal/`, data),
  applyPenalty:  (id)  => api.post(`/tax/filings/${id}/apply_penalty/`),

  // ── History & compliance ──────────────────────────────────
  history:       (id)  => api.get(`/tax/filings/${id}/history/`),
  myCompliance:  ()    => api.get('/tax/filings/my_compliance/'),
  summary:       ()    => api.get('/tax/filings/summary/'),

  // ── Tax calculation ───────────────────────────────────────
  calculate: (data) => api.post('/tax/calculate/', data),

  // ── Documents ─────────────────────────────────────────────
  listDocuments:  (filingId) => api.get(`/tax/filings/${filingId}/documents/`),
  uploadDocument: (filingId, formData) => api.post(
    `/tax/filings/${filingId}/documents/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
  deleteDocument: (filingId, docId) => api.delete(`/tax/filings/${filingId}/documents/${docId}/`),

  // ── Compliance certificates ───────────────────────────────
  listCertificates: () => api.get('/tax/certificates/'),
  issueCertificate: (data) => api.post('/tax/certificates/issue/', data),

  // ── Announcements ─────────────────────────────────────────
  announcements: () => api.get('/tax/announcements/'),
};
