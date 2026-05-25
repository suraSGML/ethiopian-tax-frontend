import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card, StatCard } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function FilingsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', tax_type: '', fiscal_year: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['filings', filters],
    queryFn: () => taxFilingAPI.list(filters).then(r => r.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taxFilingAPI.delete(id),
    onSuccess: () => {
      toast.success('Draft filing deleted.');
      setDeleteTarget(null);
      queryClient.invalidateQueries(['filings']);
    },
    onError: () => toast.error('Could not delete filing.'),
  });

  const filings = data?.results || [];
  const totalDue = filings.filter(f => ['approved','overdue'].includes(f.status)).reduce((s, f) => s + Number(f.balance_due || 0), 0);
  const overdueCount = filings.filter(f => f.status === 'overdue').length;
  const paidCount = filings.filter(f => f.status === 'paid').length;

  const columns = [
    {
      header: 'Reference', key: 'reference_number',
      render: (v, row) => (
        <Link to={`/filings/${row.id}`} style={{ color: '#1a5276', fontWeight: 700, textDecoration: 'none', fontSize: '0.82rem', fontFamily: 'monospace' }}>
          {v}
        </Link>
      )
    },
    {
      header: 'Tax Type', key: 'tax_type',
      render: v => <span style={{ fontSize: '0.82rem' }}>{v?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
    },
    { header: 'Year', key: 'fiscal_year', render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { header: 'Period', key: 'filing_period', render: v => v?.charAt(0).toUpperCase() + v?.slice(1) },
    { header: 'Tax Due', key: 'total_due', render: v => <span style={{ fontWeight: 700 }}>{formatETB(v)}</span>, align: 'right' },
    { header: 'Paid', key: 'amount_paid', render: v => <span style={{ color: '#1e8449', fontWeight: 600 }}>{formatETB(v)}</span>, align: 'right' },
    { header: 'Status', key: 'status', render: v => <Badge status={v} /> },
    {
      header: 'Due Date', key: 'due_date',
      render: v => {
        if (!v) return '—';
        const date = new Date(v);
        const isOverdue = date < new Date();
        return (
          <span style={{ fontSize: '0.8rem', color: isOverdue ? '#c0392b' : '#64748b', fontWeight: isOverdue ? 600 : 400 }}>
            {isOverdue ? '⚠ ' : ''}{format(date, 'dd MMM yyyy')}
          </span>
        );
      }
    },
    {
      header: 'Actions', key: 'id',
      render: (v, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link to={`/filings/${v}`}><Button size="xs" variant="outline">View</Button></Link>
          {row.status === 'approved' && Number(row.balance_due) > 0 && (
            <Link to={`/payments/pay/${v}`}><Button size="xs" variant="success">Pay</Button></Link>
          )}
          {row.status === 'draft' && (
            <Button size="xs" variant="danger" onClick={() => setDeleteTarget(row)}>✕</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: 'Tax Filings' }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Tax Filings</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage and track your tax filings</p>
        </div>
        <Link to="/filings/new">
          <Button icon="+" iconRight="→">New Filing</Button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Filings" value={data?.count || 0} icon="📋" color="#1a5276" loading={isLoading} />
        <StatCard title="Balance Due" value={formatETB(totalDue)} icon="💰" color="#d97706" loading={isLoading} />
        <StatCard title="Paid" value={paidCount} icon="✅" color="#1e8449" loading={isLoading} />
        <StatCard title="Overdue" value={overdueCount} icon="⚠️" color="#c0392b" loading={isLoading} />
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {['draft','submitted','under_review','approved','rejected','paid','overdue'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <Select value={filters.tax_type} onChange={e => setFilters(f => ({ ...f, tax_type: e.target.value }))}>
              <option value="">All Tax Types</option>
              <option value="personal_income">Personal Income</option>
              <option value="business_income">Business Income</option>
              <option value="vat">VAT</option>
              <option value="turnover">Turnover Tax</option>
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: '110px' }}>
            <Select value={filters.fiscal_year} onChange={e => setFilters(f => ({ ...f, fiscal_year: e.target.value }))}>
              <option value="">All Years</option>
              {[2025,2024,2023,2022].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          {(filters.status || filters.tax_type || filters.fiscal_year) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ status: '', tax_type: '', fiscal_year: '' })}>
              ✕ Clear
            </Button>
          )}
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
            {data?.count || 0} filing(s)
          </span>
        </div>
        {isLoading ? (
          <div style={{ padding: '1rem' }}><SkeletonTable rows={5} cols={7} /></div>
        ) : filings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>No filings found</p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {filters.status || filters.tax_type ? 'Try adjusting your filters.' : 'Create your first tax filing to get started.'}
            </p>
            {!filters.status && !filters.tax_type && (
              <Link to="/filings/new"><Button>+ Create First Filing</Button></Link>
            )}
          </div>
        ) : (
          <Table columns={columns} data={filings} />
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        title="Delete Draft Filing"
        message={`Delete draft filing ${deleteTarget?.reference_number}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
