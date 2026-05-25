import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function AppealPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: filing, isLoading } = useQuery({
    queryKey: ['filing', id],
    queryFn: () => taxFilingAPI.get(id).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => taxFilingAPI.appeal(id, { appeal_reason: reason }),
    onSuccess: (res) => {
      toast.success('Appeal submitted. A senior officer will review within 5 business days.');
      queryClient.invalidateQueries(['filing', id]);
      queryClient.invalidateQueries(['filings']);
      navigate(`/filings/${id}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Appeal submission failed.'),
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  if (!filing) return <div>Filing not found.</div>;

  if (filing.status !== 'rejected') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>Cannot Appeal</h2>
        <p style={{ color: 'var(--gray-500)' }}>Only rejected filings can be appealed.</p>
        <Button variant="outline" onClick={() => navigate(`/filings/${id}`)} style={{ marginTop: '1.5rem' }}>
          Back to Filing
        </Button>
      </div>
    );
  }

  const daysLeft = filing.days_until_appeal_expires;
  const isExpired = daysLeft === 0;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }} className="animate-fade-in">
      <Breadcrumb items={[
        { label: 'My Filings', href: '/filings' },
        { label: filing.reference_number, href: `/filings/${id}` },
        { label: 'File Appeal' },
      ]} />

      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--gray-800)' }}>
        File an Appeal
      </h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.75rem' }}>
        Dispute the rejection of your tax filing
      </p>

      {/* Appeal window warning */}
      {daysLeft !== null && (
        <div style={{
          padding: '1rem 1.25rem',
          background: isExpired ? 'var(--danger-light)' : daysLeft <= 7 ? '#fef3c7' : '#f0fdf4',
          border: `1px solid ${isExpired ? '#fca5a5' : daysLeft <= 7 ? '#fcd34d' : '#86efac'}`,
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>{isExpired ? '🚫' : daysLeft <= 7 ? '⏰' : '✅'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: isExpired ? 'var(--danger)' : daysLeft <= 7 ? '#92400e' : 'var(--success)' }}>
              {isExpired ? 'Appeal Window Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining to appeal`}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: '2px' }}>
              Appeals must be filed within 30 days of rejection.
              {filing.reviewed_at && ` Rejected on ${format(new Date(filing.reviewed_at), 'dd MMM yyyy')}.`}
            </div>
          </div>
        </div>
      )}

      {/* Filing summary */}
      <Card padding="1.25rem" style={{ marginBottom: '1.25rem', background: 'var(--gray-50)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--text-base)' }}>
              {filing.reference_number}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: '2px' }}>
              {filing.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} • {filing.fiscal_year}
            </div>
          </div>
          <Badge status="rejected" size="lg" />
        </div>
        {filing.rejection_reason && (
          <div style={{
            marginTop: '1rem', padding: '0.875rem',
            background: 'var(--danger-light)',
            borderRadius: 'var(--radius)',
            borderLeft: '3px solid var(--danger)',
          }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              Rejection Reason
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: '#7f1d1d', lineHeight: 1.6 }}>
              {filing.rejection_reason}
            </p>
          </div>
        )}
      </Card>

      {/* Appeal form */}
      <Card padding="1.75rem" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: 'var(--text-lg)', color: 'var(--gray-800)' }}>
          Your Appeal Statement
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Clearly explain why you believe the rejection was incorrect. Include any supporting evidence or corrections.
          Minimum 20 characters required.
        </p>
        <Textarea
          label="Appeal Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={6}
          placeholder="Example: The rejection states my income was incorrectly calculated. I have attached my official payslips showing gross income of ETB 45,000 for the period. The deductions claimed are legitimate business expenses as per MOR guidelines section 4.2..."
          required
          hint={`${reason.length} characters (minimum 20)`}
          error={reason.length > 0 && reason.length < 20 ? 'Please provide more detail (minimum 20 characters)' : ''}
        />

        {/* Character count bar */}
        <div style={{ marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{
              width: `${Math.min((reason.length / 500) * 100, 100)}%`,
              background: reason.length < 20 ? 'var(--danger)' : reason.length < 100 ? 'var(--warning)' : 'var(--success)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>
            <span>Too short</span>
            <span>Good</span>
            <span>Detailed</span>
          </div>
        </div>
      </Card>

      {/* What happens next */}
      <Card padding="1.5rem" style={{ marginBottom: '1.75rem', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
          📋 What happens after you submit?
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { step: '1', text: 'Your appeal is assigned to a senior tax officer (different from the original reviewer)', time: 'Immediately' },
            { step: '2', text: 'Officer reviews your appeal statement and supporting documents', time: '1–3 business days' },
            { step: '3', text: 'Decision: Appeal Upheld (filing approved) or Dismissed (rejection stands)', time: '3–5 business days' },
            { step: '4', text: 'You receive a notification with the outcome and detailed explanation', time: 'Upon decision' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px', height: '24px', flexShrink: 0,
                background: 'var(--primary)', color: '#fff',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-xs)', fontWeight: 700,
              }}>
                {item.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)', lineHeight: 1.5 }}>{item.text}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={() => navigate(`/filings/${id}`)} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={reason.length < 20 || isExpired}
          style={{ flex: 2 }}
          icon="⚖️"
        >
          Submit Appeal
        </Button>
      </div>
    </div>
  );
}
