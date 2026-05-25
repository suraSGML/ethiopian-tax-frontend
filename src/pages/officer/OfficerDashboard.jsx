import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function OfficerDashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['filings-summary'],
    queryFn: () => taxFilingAPI.summary().then(r => r.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: pendingFilings, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-filings'],
    queryFn: () => taxFilingAPI.list({ status: 'submitted' }).then(r => r.data?.results || r.data || []),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const stats = summary || {
    total_filings: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    total_revenue: 0,
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Review Queue</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review and approve taxpayer filings</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{stats.pending_review}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Pending Review</div>
        </Card>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e8449' }}>{stats.approved}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Approved</div>
        </Card>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c0392b' }}>{stats.rejected}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Rejected</div>
        </Card>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a5276' }}>{formatETB(stats.total_revenue)}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Revenue</div>
        </Card>
      </div>

      {/* Pending Filings */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>📋 Pending Filings</h3>
          <Link to="/officer/filings">
            <Button size="sm" variant="outline">View All</Button>
          </Link>
        </div>
        {pendingLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</div>
        ) : pendingFilings && pendingFilings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingFilings.slice(0, 5).map((filing, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc', borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                    {filing.reference_number || `Filing #${filing.id?.slice(0, 8)}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {filing.user_name} • {filing.tax_type?.replace(/_/g,' ')} • {formatETB(filing.total_due)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge status={filing.status} />
                  <Link to={`/officer/filings/${filing.id}`}>
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
            <p style={{ fontSize: '0.875rem' }}>No pending filings to review</p>
          </div>
        )}
      </Card>
    </div>
  );
}
