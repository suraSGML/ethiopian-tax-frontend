import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../../api/auth';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ role: 'taxpayer', is_active: '', is_verified: '' });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters, search],
    queryFn: () => authAPI.listUsers({ ...filters, search }).then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => authAPI.toggleUserActive(id),
    onSuccess: () => {
      toast.success('User status updated.');
      queryClient.invalidateQueries(['users']);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => authAPI.verifyUser(id),
    onSuccess: () => {
      toast.success('User verified.');
      queryClient.invalidateQueries(['users']);
    },
  });

  const columns = [
    { header: 'Name', key: 'first_name', render: (v, row) => `${row.first_name} ${row.last_name}` },
    { header: 'Email', key: 'email' },
    { header: 'TIN', key: 'tin', render: v => v || '—' },
    { header: 'Role', key: 'role', render: v => <Badge status={v} label={v?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} /> },
    { header: 'Verified', key: 'is_verified', render: v => v ? <span style={{ color: '#1e8449' }}>✓ Yes</span> : <span style={{ color: '#d97706' }}>⚠ No</span> },
    { header: 'Active', key: 'is_active', render: v => v ? <Badge status="approved" label="Active" /> : <Badge status="rejected" label="Inactive" /> },
    { header: 'Joined', key: 'date_joined', render: v => format(new Date(v), 'dd MMM yyyy') },
    { header: 'Actions', key: 'id', render: (v, row) => (
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {!row.is_verified && (
          <Button size="sm" variant="success" onClick={() => verifyMutation.mutate(v)}>Verify</Button>
        )}
        <Button size="sm" variant={row.is_active ? 'danger' : 'outline'} onClick={() => toggleMutation.mutate(v)}>
          {row.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Taxpayer Management</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage registered taxpayers</p>
      </div>

      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <input
              placeholder="Search by name, email, or TIN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '130px' }}>
            <Select value={filters.is_active} onChange={e => setFilters(f => ({ ...f, is_active: e.target.value }))}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: '130px' }}>
            <Select value={filters.is_verified} onChange={e => setFilters(f => ({ ...f, is_verified: e.target.value }))}>
              <option value="">All Verified</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{data?.count || 0} taxpayer(s)</span>
        </div>
        <Table columns={columns} data={data?.results || []} loading={isLoading} emptyMessage="No taxpayers found." />
      </Card>
    </div>
  );
}
