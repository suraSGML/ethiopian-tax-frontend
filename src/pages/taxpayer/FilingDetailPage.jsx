import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonCard } from '../../components/ui/Skeleton';
import FilingTimeline from '../../components/FilingTimeline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

const DOC_TYPES = [
  { value: 'income_statement', label: 'Income Statement' },
  { value: 'balance_sheet',    label: 'Balance Sheet' },
  { value: 'receipt',          label: 'Receipt' },
  { value: 'invoice',          label: 'Invoice' },
  { value: 'bank_statement',   label: 'Bank Statement' },
  { value: 'other',            label: 'Other' },
];

export default function FilingDetailPage({ isAdmin, isOfficer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef();

  const [reviewData, setReviewData] = useState({ status: 'approved', review_notes: '' });
  const [showReview, setShowReview] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('other');
  const [uploading, setUploading] = useState(false);
  const [showCalcDetails, setShowCalcDetails] = useState(false);

  // Redirect if id is missing
  React.useEffect(() => {
    if (!id) {
      toast.error('Invalid filing ID');
      navigate(isAdmin ? '/admin/filings' : isOfficer ? '/officer/filings' : '/filings');
    }
  }, [id, navigate, isAdmin, isOfficer]);

  const { data: filing, isLoading } = useQuery({
    queryKey: ['filing', id],
    queryFn: () => taxFilingAPI.get(id).then(r => r.data),
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: documents, refetch: refetchDocs } = useQuery({
    queryKey: ['filing-docs', id],
    queryFn: () => taxFilingAPI.listDocuments(id).then(r => r.data?.results || r.data || []),
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('Invalid filing ID');
      return taxFilingAPI.submit(id);
    },
    onSuccess: () => {
      toast.success('Filing submitted successfully!');
      setShowSubmitConfirm(false);
      queryClient.invalidateQueries(['filing', id]);
      queryClient.invalidateQueries(['filings']);
    },
    onError: err => toast.error(err.response?.data?.error || err.message || 'Submit failed.'),
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => {
      if (!id) throw new Error('Invalid filing ID');
      return taxFilingAPI.review(id, data);
    },
    onSuccess: () => {
      toast.success('Filing reviewed successfully.');
      setShowReview(false);
      queryClient.invalidateQueries(['filing', id]);
      queryClient.invalidateQueries(['all-filings']);
    },
    onError: err => toast.error(err.response?.data?.error || err.message || 'Review failed.'),
  });

  const handleUpload = async () => {
    if (!id) { toast.error('Invalid filing ID'); return; }
    if (!uploadFile) { toast.error('Select a file first.'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('document_type', uploadType);
      await taxFilingAPI.uploadDocument(id, formData);
      toast.success('Document uploaded successfully.');
      setShowUpload(false);
      setUploadFile(null);
      refetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!id) { toast.error('Invalid filing ID'); return; }
    try {
      await taxFilingAPI.deleteDocument(id, docId);
      toast.success('Document removed.');
      refetchDocs();
    } catch {
      toast.error('Could not delete document.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }
  if (!filing) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <p style={{ color: '#64748b' }}>Filing not found.</p>
      <Button variant="outline" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>Go Back</Button>
    </div>
  );

  const f = filing;
  const canSubmit = f.status === 'draft';
  const canPay = f.status === 'approved' && f.balance_due > 0;

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[
        { label: isAdmin ? 'All Filings' : isOfficer ? 'Review Queue' : 'My Filings', href: isAdmin ? '/admin/filings' : isOfficer ? '/officer/filings' : '/filings' },
        { label: f.reference_number || `Filing #${f.id?.slice(0, 8)}` || 'Filing Detail' },
      ]} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>{f.reference_number || `Filing #${f.id?.slice(0, 8)}` || 'Filing'}</h1>
            <Badge status={f.status} />
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {f.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} •{' '}
            {f.fiscal_year} • {f.filing_period?.charAt(0).toUpperCase() + f.filing_period?.slice(1)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {canSubmit && !isOfficer && (
            <Button icon="📤" onClick={() => setShowSubmitConfirm(true)}>
              Submit Filing
            </Button>
          )}
          {canPay && !isOfficer && (
            <Link to={`/payments/pay/${f.id}`}>
              <Button variant="success" icon="💳">Pay Now</Button>
            </Link>
          )}
          {/* Appeal button — only for rejected filings within 30 days */}
          {f.status === 'rejected' && f.can_be_appealed && !isAdmin && !isOfficer && (
            <Link to={`/filings/${f.id}/appeal`}>
              <Button variant="warning" icon="⚖️">File Appeal</Button>
            </Link>
          )}
          {/* Amendment button — only for paid/approved filings */}
          {f.can_be_amended && !isAdmin && !isOfficer && (
            <Link to={`/filings/${f.id}/amend`}>
              <Button variant="outline" icon="📝">Amend Filing</Button>
            </Link>
          )}
          {(isAdmin || isOfficer) && f.status === 'submitted' && (
            <Button icon="🔍" onClick={() => setShowReview(true)}>Review Filing</Button>
          )}
          {(isAdmin || isOfficer) && f.status === 'appealed' && (
            <Button variant="warning" icon="⚖️" onClick={() => setShowReview(true)}>Resolve Appeal</Button>
          )}
          {!isOfficer && (
            <Button variant="secondary" icon="📎" onClick={() => setShowUpload(true)}>
              Upload Doc
            </Button>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <Card style={{ marginBottom: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {['draft','submitted','under_review','approved','paid'].map((s, i, arr) => {
            const statuses = ['draft','submitted','under_review','approved','paid','overdue','rejected'];
            const currentIdx = statuses.indexOf(f.status);
            const stepIdx = statuses.indexOf(s);
            const isDone = currentIdx >= stepIdx && f.status !== 'rejected';
            const isCurrent = f.status === s;
            const labels = { draft:'Draft', submitted:'Submitted', under_review:'Under Review', approved:'Approved', paid:'Paid' };
            return (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isDone ? '#1a5276' : '#e2e8f0',
                    border: isCurrent ? '3px solid #f39c12' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', color: isDone ? '#fff' : '#94a3b8',
                    fontWeight: 700, transition: 'all 0.3s', flexShrink: 0,
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: isDone ? '#1a5276' : '#94a3b8', marginTop: '4px', fontWeight: isCurrent ? 700 : 400, textAlign: 'center' }}>
                    {labels[s]}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{
                    flex: 1, height: '2px', minWidth: '20px',
                    background: isDone && currentIdx > stepIdx ? '#1a5276' : '#e2e8f0',
                    transition: 'background 0.3s', marginBottom: '16px',
                  }} />
                )}
              </React.Fragment>
            );
          })}
          {f.status === 'rejected' && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge status="rejected" />
            </div>
          )}
          {f.status === 'overdue' && (
            <div style={{ marginLeft: 'auto' }}>
              <Badge status="overdue" />
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Financial summary */}
        <Card>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💰 Financial Summary
          </h3>
          {[
            { label: 'Gross Income',          value: formatETB(f.gross_income) },
            { label: 'Allowable Deductions',  value: formatETB(f.allowable_deductions) },
            { label: 'Taxable Income',        value: formatETB(f.taxable_income) },
            { label: 'Calculated Tax',        value: formatETB(f.calculated_tax), bold: true },
            ...(f.penalty_amount > 0 ? [{ label: 'Penalty', value: formatETB(f.penalty_amount), color: '#c0392b' }] : []),
            ...(f.late_fee > 0 ? [{ label: 'Late Fee', value: formatETB(f.late_fee), color: '#c0392b' }] : []),
            { label: 'Total Due',             value: formatETB(f.total_due), bold: true, color: '#1a5276' },
            { label: 'Amount Paid',           value: formatETB(f.amount_paid), color: '#1e8449' },
            { label: 'Balance Due',           value: formatETB(f.balance_due), bold: true, color: f.balance_due > 0 ? '#c0392b' : '#1e8449' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: i < 8 ? '1px solid #f8fafc' : 'none',
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.label}</span>
              <span style={{ fontWeight: item.bold ? 700 : 500, color: item.color || '#1e293b', fontSize: '0.875rem' }}>
                {item.value}
              </span>
            </div>
          ))}

          {/* Balance due progress */}
          {f.total_due > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Payment Progress</span>
                <span>{Math.round((f.amount_paid / f.total_due) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${Math.min((f.amount_paid / f.total_due) * 100, 100)}%` }} />
              </div>
            </div>
          )}
        </Card>

        {/* Filing info */}
        <Card>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Filing Information
          </h3>
          {[
            { label: 'Taxpayer',       value: f.user_name },
            { label: 'TIN',            value: f.user_tin, mono: true },
            { label: 'Submitted',      value: f.submission_date ? format(new Date(f.submission_date), 'dd MMM yyyy HH:mm') : '—' },
            { label: 'Due Date',       value: f.due_date ? format(new Date(f.due_date), 'dd MMM yyyy') : '—' },
            { label: 'Reviewed By',    value: f.reviewed_by || '—' },
            { label: 'Reviewed At',    value: f.reviewed_at ? format(new Date(f.reviewed_at), 'dd MMM yyyy') : '—' },
            { label: 'Created',        value: format(new Date(f.created_at), 'dd MMM yyyy HH:mm') },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.label}</span>
              <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 500, fontFamily: item.mono ? 'monospace' : 'inherit' }}>
                {item.value}
              </span>
            </div>
          ))}

          {f.review_notes && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', borderLeft: '3px solid #d97706' }}>
              <strong>Review Notes:</strong> {f.review_notes}
            </div>
          )}
        </Card>
      </div>

      {/* Documents */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>📎 Supporting Documents</h3>
          {!isOfficer && (
            <Button size="sm" variant="outline" icon="+" onClick={() => setShowUpload(true)}>Upload</Button>
          )}
        </div>
        {documents && documents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {documents.map((doc, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#f8fafc', borderRadius: '8px',
                border: '1px solid #e2e8f0',
                animation: 'fadeIn 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {doc.file_name?.endsWith('.pdf') ? '📄' : doc.file_name?.match(/\.(jpg|jpeg|png)$/i) ? '🖼' : '📁'}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>{doc.file_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {doc.document_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} •{' '}
                      {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} •{' '}
                      {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'dd MMM yyyy') : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={doc.file} target="_blank" rel="noreferrer">
                    <Button size="xs" variant="outline">View</Button>
                  </a>
                  {!isAdmin && !isOfficer && (
                    <Button size="xs" variant="danger" onClick={() => handleDeleteDoc(doc.id)}>✕</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
            <p style={{ fontSize: '0.875rem' }}>No documents uploaded yet.</p>
            {!isOfficer && (
              <Button size="sm" variant="outline" onClick={() => setShowUpload(true)} style={{ marginTop: '0.75rem' }}>
                Upload First Document
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Status timeline */}
      <Card style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowCalcDetails(!showCalcDetails)}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}
        >
          <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--gray-800)' }}>
            📜 Filing History & Audit Trail
          </h3>
          <span style={{ color: 'var(--gray-400)', transition: 'transform 0.2s', transform: showCalcDetails ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>
        {showCalcDetails && (
          <div style={{ marginTop: '1.25rem', animation: 'slideDown 0.2s ease' }}>
            <FilingTimeline filingId={f.id} />
          </div>
        )}
      </Card>

      {/* Calculation details (collapsible) */}
      {f.calculation_log && (
        <Card style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowCalcDetails(!showCalcDetails)}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 0, color: '#1e293b',
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>🧮 Calculation Breakdown</h3>
            <span style={{ color: '#94a3b8', transition: 'transform 0.2s', transform: showCalcDetails ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>
          {showCalcDetails && (
            <div style={{ marginTop: '1rem', animation: 'slideDown 0.2s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(f.calculation_log.calculation_details || {})
                  .filter(([k, v]) => typeof v === 'number' || typeof v === 'string')
                  .map(([k, v]) => (
                    <div key={k} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'capitalize', marginBottom: '4px' }}>
                        {k.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                        {typeof v === 'number'
                          ? (k.includes('rate') ? `${(v * 100).toFixed(1)}%` : formatETB(v))
                          : String(v)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Submit confirmation */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => submitMutation.mutate()}
        title="Submit Filing"
        message={`Submit filing ${f.reference_number} for review? Once submitted, you cannot edit it.`}
        confirmLabel="Submit"
        confirmVariant="primary"
        loading={submitMutation.isPending}
      />

      {/* Document upload modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => { setShowUpload(false); setUploadFile(null); }}
        title="Upload Supporting Document"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowUpload(false); setUploadFile(null); }}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading} disabled={!uploadFile}>Upload</Button>
          </>
        }
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
            Document Type
          </label>
          <select
            value={uploadType}
            onChange={e => setUploadType(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' }}
          >
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: uploadFile ? '#f0fdf4' : '#f8fafc',
            borderColor: uploadFile ? '#1e8449' : '#d1d5db',
          }}
          onMouseEnter={e => { if (!uploadFile) e.currentTarget.style.borderColor = '#2e86c1'; }}
          onMouseLeave={e => { if (!uploadFile) e.currentTarget.style.borderColor = '#d1d5db'; }}
        >
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            onChange={e => setUploadFile(e.target.files[0])}
          />
          {uploadFile ? (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <p style={{ fontWeight: 600, color: '#1e8449', fontSize: '0.875rem' }}>{uploadFile.name}</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{(uploadFile.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Click to select file</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>PDF, JPG, PNG, Excel, Word (max 10MB)</p>
            </>
          )}
        </div>
      </Modal>

      {/* Admin review modal — handles both review and appeal resolution */}
      <Modal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        title={f.status === 'appealed' ? 'Resolve Appeal' : 'Review Filing'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowReview(false)}>Cancel</Button>
            <Button
              variant={reviewData.status === 'approved' ? 'success' : reviewData.status === 'rejected' ? 'danger' : 'primary'}
              onClick={() => reviewMutation.mutate(reviewData)}
              loading={reviewMutation.isPending}
            >
              {reviewData.status === 'approved' ? '✓ Approve' : reviewData.status === 'rejected' ? '✕ Reject' : 'Submit'}
            </Button>
          </>
        }
      >
        <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
          <strong>{f.user_name}</strong> • {f.reference_number} • {formatETB(f.total_due)}
          {f.status === 'appealed' && f.appeal_reason && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#dbeafe', borderRadius: 'var(--radius-sm)', color: '#1d4ed8' }}>
              <strong>Appeal Reason:</strong> {f.appeal_reason}
            </div>
          )}
        </div>

        {f.status === 'appealed' ? (
          <Select
            label="Appeal Decision"
            value={reviewData.status}
            onChange={e => setReviewData(d => ({ ...d, status: e.target.value }))}
          >
            <option value="approved">✓ Uphold Appeal — Approve Filing</option>
            <option value="rejected">✕ Dismiss Appeal — Keep Rejected</option>
          </Select>
        ) : (
          <Select
            label="Decision"
            value={reviewData.status}
            onChange={e => setReviewData(d => ({ ...d, status: e.target.value }))}
          >
            <option value="approved">✓ Approve Filing</option>
            <option value="rejected">✕ Reject Filing</option>
            <option value="under_review">🔍 Mark Under Review</option>
          </Select>
        )}

        {reviewData.status === 'rejected' && (
          <Textarea
            label="Rejection Reason (required)"
            value={reviewData.rejection_reason || ''}
            onChange={e => setReviewData(d => ({ ...d, rejection_reason: e.target.value }))}
            placeholder="Provide a clear, specific reason for rejection. The taxpayer will see this and may appeal."
            rows={3}
            required
            hint="Minimum 10 characters. Be specific — vague reasons lead to appeals."
          />
        )}

        <Textarea
          label="Review Notes (optional)"
          value={reviewData.review_notes}
          onChange={e => setReviewData(d => ({ ...d, review_notes: e.target.value }))}
          placeholder="Additional notes for the taxpayer..."
          rows={2}
        />
      </Modal>
    </div>
  );
}
