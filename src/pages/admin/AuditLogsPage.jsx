import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({ action: '', is_suspicious: '' });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters, search],
    queryFn: () => dashboardAPI.auditLogs({ ...filters, search }).then(r => r.data),
  });

  const columns = [
    { header: 'User', key: 'user_email' },
    { header: 'TIN', key: 'user_tin', render: v => v || '—' },
    { header: 'Action', key: 'action', render: v => (
      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
        {v}
      </span>
    )},
    { header: 'Method', key: 'method', render: v => (
      <span style={{ fontWeight: 600, color: v === 'POST' ? '#1e8449' : v === 'DELETE' ? '#c0392b' : '#1a5276', fontSize: '0.8rem' }}>{v}</span>
    )},
    { header: 'Endpoint', key: 'endpoint', render: v => <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{v}</span> },
    { header: 'IP', key: 'ip_address', render: v => v || '—' },
    { header: 'Status', key: 'status_code', render: v => (
      <span style={{ color: v >= 400 ? '#c0392b' : '#1e8449', fontWeight: 600, fontSize: '0.8rem' }}>{v}</span>
    )},
    { header: 'Suspicious', key: 'is_suspicious', render: v => v ? <Badge status="critical" label="⚠ Yes" /> : '—' },
    { header: 'Timestamp', key: 'timestamp', render: v => format(new Date(v), 'dd MMM HH:mm:ss') },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Audit Logs</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Complete activity trail for compliance and security</p>
      </div>

      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Search by email, TIN, IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 2, minWidth: '200px', padding: '0.625rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' }}
          />
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}>
              <option value="">All Actions</option>
              {['login','logout','register','filing_create','filing_submit','payment_initiate','payment_complete','refund','admin_action'].map(a => (
                <option key={a} value={a}>{a.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select value={filters.is_suspicious} onChange={e => setFilters(f => ({ ...f, is_suspicious: e.target.value }))}>
              <option value="">All</option>
              <option value="true">Suspicious Only</option>
              <option value="false">Normal Only</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{data?.count || 0} log entries</span>
        </div>
        <Table columns={columns} data={data?.results || []} loading={isLoading} emptyMessage="No audit logs found." />
      </Card>
    </div>
  );
}
