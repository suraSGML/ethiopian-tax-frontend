import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function FraudAlertsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'open', severity: '' });
  const [resolving, setResolving] = useState(null);
  const [resolution, setResolution] = useState({ status: 'resolved', resolution_notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['fraud-alerts', filters],
    queryFn: () => dashboardAPI.fraudAlerts(filters).then(r => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }) => dashboardAPI.resolveAlert(id, data),
    onSuccess: () => {
      toast.success('Alert resolved.');
      setResolving(null);
      queryClient.invalidateQueries(['fraud-alerts']);
    },
    onError: () => toast.error('Failed to resolve alert.'),
  });

  const columns = [
    { header: 'Alert Type', key: 'alert_type', render: v => v?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) },
    { header: 'Taxpayer', key: 'user_email' },
    { header: 'TIN', key: 'user_tin' },
    { header: 'Severity', key: 'severity', render: v => <Badge status={v} /> },
    { header: 'Status', key: 'status', render: v => <Badge status={v} /> },
    { header: 'Description', key: 'description', render: v => <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v?.slice(0, 60)}...</span> },
    { header: 'Created', key: 'created_at', render: v => format(new Date(v), 'dd MMM yyyy HH:mm') },
    { header: 'Actions', key: 'id', render: (v, row) => (
      row.status === 'open' || row.status === 'investigating' ? (
        <Button size="sm" onClick={() => setResolving(row)}>Resolve</Button>
      ) : <Badge status={row.status} />
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Fraud Alerts</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Monitor and investigate suspicious activity</p>
      </div>

      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{data?.count || 0} alert(s)</span>
        </div>
        <Table columns={columns} data={data?.results || []} loading={isLoading} emptyMessage="No fraud alerts." />
      </Card>

      {/* Resolve modal */}
      {resolving && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <Card style={{ width: '480px', maxWidth: '90vw' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Resolve Alert</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
              {resolving.alert_type?.replace(/_/g,' ')} — {resolving.user_email}
            </p>
            <Select label="Resolution" value={resolution.status} onChange={e => setResolution(r => ({ ...r, status: e.target.value }))}>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
              <option value="investigating">Mark as Investigating</option>
            </Select>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Notes</label>
              <textarea
                value={resolution.resolution_notes}
                onChange={e => setResolution(r => ({ ...r, resolution_notes: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', resize: 'vertical' }}
                placeholder="Add resolution notes..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setResolving(null)} style={{ flex: 1 }}>Cancel</Button>
              <Button onClick={() => resolveMutation.mutate({ id: resolving.id, data: resolution })} loading={resolveMutation.isPending} style={{ flex: 1 }}>
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
