import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { format } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function AllFilingsPage() {
  const location = useLocation();
  const isOfficer = location.pathname.startsWith('/officer');
  const [filters, setFilters] = useState({ status: '', tax_type: '' });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['all-filings', filters, search],
    queryFn: () => taxFilingAPI.list({ ...filters, search }).then(r => r.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: summary } = useQuery({
    queryKey: ['filings-summary'],
    queryFn: () => taxFilingAPI.summary().then(r => r.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const columns = [
    { header: 'Reference', key: 'reference_number', render: (v, row) => (
      <Link to={`${isOfficer ? '/officer' : '/admin'}/filings/${row.id}`} style={{ color: '#1a5276', fontWeight: 600, textDecoration: 'none' }}>{v}</Link>
    )},
    { header: 'Taxpayer', key: 'user_name' },
    { header: 'TIN', key: 'user_tin' },
    { header: 'Tax Type', key: 'tax_type', render: v => v?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) },
    { header: 'Year', key: 'fiscal_year' },
    { header: 'Total Due', key: 'total_due', render: v => formatETB(v), align: 'right' },
    { header: 'Paid', key: 'amount_paid', render: v => formatETB(v), align: 'right' },
    { header: 'Status', key: 'status', render: v => <Badge status={v} /> },
    { header: 'Submitted', key: 'submission_date', render: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
    { header: 'Actions', key: 'id', render: (v, row) => (
      <Link to={`${isOfficer ? '/officer' : '/admin'}/filings/${v}`}><Button size="sm" variant="outline">Review</Button></Link>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{isOfficer ? 'Review Queue' : 'All Tax Filings'}</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{isOfficer ? 'Review and approve taxpayer filings' : 'Review and manage all taxpayer filings'}</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total', value: summary.total_filings, color: '#1a5276' },
            { label: 'Pending Review', value: summary.by_status?.submitted || 0, color: '#d97706' },
            { label: 'Approved', value: summary.by_status?.approved || 0, color: '#1e8449' },
            { label: 'Overdue', value: summary.by_status?.overdue || 0, color: '#c0392b' },
          ].map((item, i) => (
            <Card key={i} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</div>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Search by reference, TIN, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 2, minWidth: '200px', padding: '0.625rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' }}
          />
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {['draft','submitted','under_review','approved','rejected','paid','overdue'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select value={filters.tax_type} onChange={e => setFilters(f => ({ ...f, tax_type: e.target.value }))}>
              <option value="">All Types</option>
              <option value="personal_income">Personal Income</option>
              <option value="business_income">Business Income</option>
              <option value="vat">VAT</option>
              <option value="turnover">Turnover</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{data?.count || 0} filing(s)</span>
        </div>
        <Table columns={columns} data={data?.results || []} loading={isLoading} emptyMessage="No filings found." />
      </Card>
    </div>
  );
}
