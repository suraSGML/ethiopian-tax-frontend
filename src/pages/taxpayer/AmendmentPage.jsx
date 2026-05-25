import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function AmendmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: filing, isLoading } = useQuery({
    queryKey: ['filing', id],
    queryFn: () => taxFilingAPI.get(id).then(r => r.data),
  });

  const [form, setForm] = useState({
    amendment_reason: '',
    gross_income: '',
    allowable_deductions: '',
    vat_collected: '',
    vat_paid: '',
  });

  // Pre-fill when filing loads
  React.useEffect(() => {
    if (filing) {
      setForm(f => ({
        ...f,
        gross_income: filing.gross_income || '',
        allowable_deductions: filing.allowable_deductions || '',
        vat_collected: filing.vat_collected || '',
        vat_paid: filing.vat_paid || '',
      }));
    }
  }, [filing]);

  const mutation = useMutation({
    mutationFn: () => taxFilingAPI.amend(id, form),
    onSuccess: (res) => {
      toast.success(`Amendment created: ${res.data.amendment_reference}. Review and submit it.`);
      queryClient.invalidateQueries(['filings']);
      navigate(`/filings/${res.data.amendment_id}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Amendment failed.'),
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  if (!filing) return <div>Filing not found.</div>;

  if (!filing.can_be_amended) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>Cannot Amend</h2>
        <p style={{ color: 'var(--gray-500)' }}>
          Only approved or paid filings can be amended. Current status: <Badge status={filing.status} />
        </p>
        <Button variant="outline" onClick={() => navigate(`/filings/${id}`)} style={{ marginTop: '1.5rem' }}>
          Back to Filing
        </Button>
      </div>
    );
  }

  const isVAT = filing.tax_type === 'vat';

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="animate-fade-in">
      <Breadcrumb items={[
        { label: 'My Filings', href: '/filings' },
        { label: filing.reference_number, href: `/filings/${id}` },
        { label: 'File Amendment' },
      ]} />

      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--gray-800)' }}>
        File an Amendment
      </h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.75rem' }}>
        Correct errors in a previously approved or paid filing
      </p>

      {/* Important notice */}
      <div style={{
        padding: '1rem 1.25rem',
        background: '#fef3c7', border: '1px solid #fcd34d',
        borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem',
        display: 'flex', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, color: '#92400e', fontSize: 'var(--text-sm)', marginBottom: '0.3rem' }}>
            Important: Amendment Rules
          </div>
          <ul style={{ fontSize: 'var(--text-sm)', color: '#78350f', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
            <li>The original filing will be marked as <strong>Amended</strong></li>
            <li>The amendment starts as a <strong>Draft</strong> — you must submit it for review</li>
            <li>If the amendment results in additional tax, you must pay the difference</li>
            <li>If you overpaid, a refund will be processed after officer approval</li>
            <li>Amendments are subject to the same review process as original filings</li>
          </ul>
        </div>
      </div>

      {/* Original filing summary */}
      <Card padding="1.25rem" style={{ marginBottom: '1.25rem', background: 'var(--gray-50)' }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Original Filing Being Amended
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Reference', value: filing.reference_number, mono: true },
            { label: 'Tax Type', value: filing.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) },
            { label: 'Year', value: filing.fiscal_year },
            { label: 'Original Tax', value: formatETB(filing.calculated_tax) },
            { label: 'Status', value: <Badge status={filing.status} size="sm" /> },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginBottom: '2px' }}>{item.label}</div>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 'var(--text-sm)', fontFamily: item.mono ? 'monospace' : 'inherit' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Amendment form */}
      <Card padding="1.75rem" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: 'var(--text-lg)', color: 'var(--gray-800)' }}>
          Corrected Financial Data
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Enter the <strong>correct</strong> values. These will replace the original figures.
        </p>

        {isVAT ? (
          <>
            <Input
              label="Corrected Taxable Sales (ETB)"
              type="number"
              value={form.vat_collected}
              onChange={e => setForm(f => ({ ...f, vat_collected: e.target.value }))}
              hint={`Original: ${formatETB(filing.vat_collected)}`}
            />
            <Input
              label="Corrected VAT Paid on Purchases (ETB)"
              type="number"
              value={form.vat_paid}
              onChange={e => setForm(f => ({ ...f, vat_paid: e.target.value }))}
              hint={`Original: ${formatETB(filing.vat_paid)}`}
            />
          </>
        ) : (
          <>
            <Input
              label="Corrected Gross Income (ETB)"
              type="number"
              value={form.gross_income}
              onChange={e => setForm(f => ({ ...f, gross_income: e.target.value }))}
              hint={`Original: ${formatETB(filing.gross_income)}`}
            />
            {filing.tax_type === 'business_income' && (
              <Input
                label="Corrected Allowable Deductions (ETB)"
                type="number"
                value={form.allowable_deductions}
                onChange={e => setForm(f => ({ ...f, allowable_deductions: e.target.value }))}
                hint={`Original: ${formatETB(filing.allowable_deductions)}`}
              />
            )}
          </>
        )}

        <Textarea
          label="Reason for Amendment"
          value={form.amendment_reason}
          onChange={e => setForm(f => ({ ...f, amendment_reason: e.target.value }))}
          rows={4}
          placeholder="Explain what was incorrect and why you are filing this amendment. E.g., 'Incorrect gross income reported due to accounting error. Correct figure verified against bank statements.'"
          required
          hint={`${form.amendment_reason.length} characters (minimum 20)`}
          error={form.amendment_reason.length > 0 && form.amendment_reason.length < 20 ? 'Minimum 20 characters required' : ''}
        />
      </Card>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={() => navigate(`/filings/${id}`)} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={form.amendment_reason.length < 20}
          style={{ flex: 2 }}
          icon="📝"
        >
          Create Amendment Draft
        </Button>
      </div>
    </div>
  );
}
