import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../api/dashboard';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageSkeleton } from '../../components/ui/Skeleton';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import { format, formatDistanceToNow } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

const METHOD_ICONS = { commercial_bank:'🏦', awash_bank:'🏦', dashen_bank:'🏦', telebirr:'📱', amole:'💳', cash:'💵' };

export default function TaxpayerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['taxpayer-dashboard'],
    queryFn: () => dashboardAPI.taxpayerDashboard().then(r => r.data),
    refetchInterval: 60000,
  });

  const { data: compliance } = useQuery({
    queryKey: ['my-compliance'],
    queryFn: () => taxFilingAPI.myCompliance().then(r => r.data),
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  if (isLoading) return <PageSkeleton />;

  const d = data || {};

  return (
    <div className="animate-fade-in">
      <AnnouncementBanner />
      {/* Welcome header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
            Welcome back, {d.user?.name?.split(' ')[0]} 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              TIN: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a5276' }}>{d.user?.tin}</span>
            </span>
            <span style={{ fontSize: '0.8rem' }}>
              {d.user?.is_verified
                ? <span style={{ color: '#1e8449', fontWeight: 600 }}>✓ Verified</span>
                : <span style={{ color: '#d97706', fontWeight: 600 }}>⚠ Pending Verification</span>
              }
            </span>
          </div>
        </div>
        <Link to="/filings/new">
          <Button icon="+" iconRight="→">New Filing</Button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Tax Paid" value={formatETB(d.payments?.total_paid)} icon="💰" color="#1e8449"
          subtitle={`${d.payments?.transaction_count || 0} transactions`} />
        <StatCard title="Balance Due" value={formatETB(d.tax_due?.total_due)} icon="📋" color="#d97706"
          subtitle="Approved & overdue" />
        <StatCard title="Total Filings" value={d.filings?.total || 0} icon="📄" color="#1a5276"
          subtitle={`${d.filings?.current_year || 0} this year`} />
        <StatCard
          title="Compliance Score"
          value={compliance ? `${compliance.score}/100` : '—'}
          icon={compliance?.grade === 'A' ? '🏆' : compliance?.grade === 'B' ? '✅' : '⚠️'}
          color={compliance?.score >= 75 ? '#1e8449' : compliance?.score >= 50 ? '#d97706' : '#c0392b'}
          subtitle={compliance ? `Grade ${compliance.grade} — ${compliance.label}` : 'Loading...'}
          onClick={() => window.location.href = '/compliance'}
        />
      </div>

      {/* Balance due alert */}
      {d.tax_due?.total_due > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>Outstanding Balance</div>
              <div style={{ color: '#78350f', fontSize: '0.8rem' }}>
                You have {formatETB(d.tax_due?.total_due)} in approved/overdue taxes
              </div>
            </div>
          </div>
          <Link to="/filings?status=approved">
            <Button variant="warning" size="sm">Pay Now →</Button>
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Filing status */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>📋 Filing Status</h3>
            <Link to="/filings"><Button variant="ghost" size="sm">View All →</Button></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Draft',        key: 'draft',        color: '#64748b', bg: '#f1f5f9' },
              { label: 'Submitted',    key: 'submitted',    color: '#1d4ed8', bg: '#dbeafe' },
              { label: 'Under Review', key: 'under_review', color: '#d97706', bg: '#fef3c7' },
              { label: 'Approved',     key: 'approved',     color: '#065f46', bg: '#d1fae5' },
              { label: 'Paid',         key: 'paid',         color: '#1e8449', bg: '#d1fae5' },
              { label: 'Overdue',      key: 'overdue',      color: '#c0392b', bg: '#fee2e2' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0.75rem',
                background: (d.filings?.[item.key] || 0) > 0 ? item.bg : '#f8fafc',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.label}</span>
                <span style={{
                  fontWeight: 700,
                  color: (d.filings?.[item.key] || 0) > 0 ? item.color : '#cbd5e1',
                  fontSize: '0.875rem',
                }}>
                  {d.filings?.[item.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b', fontSize: '0.95rem' }}>⏰ Upcoming Deadlines</h3>
          {d.upcoming_deadlines?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {d.upcoming_deadlines.map((f, i) => {
                const daysLeft = Math.ceil((new Date(f.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 3;
                return (
                  <Link key={i} to={`/filings/${f.id || ''}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '0.75rem',
                      background: isUrgent ? '#fef2f2' : '#fef3c7',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${isUrgent ? '#c0392b' : '#d97706'}`,
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isUrgent ? '#991b1b' : '#92400e' }}>
                          {f.tax_type?.replace(/_/g,' ').toUpperCase()}
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          color: isUrgent ? '#c0392b' : '#d97706',
                          background: isUrgent ? '#fee2e2' : '#fef3c7',
                          padding: '2px 8px', borderRadius: '10px',
                        }}>
                          {daysLeft <= 0 ? 'TODAY' : `${daysLeft}d left`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '0.2rem' }}>
                        Due: {format(new Date(f.due_date), 'dd MMM yyyy')} • {formatETB(f.total_due)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              <p style={{ fontSize: '0.875rem' }}>No upcoming deadlines</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent payments */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>💳 Recent Payments</h3>
          <Link to="/payments"><Button variant="ghost" size="sm">View All →</Button></Link>
        </div>
        {d.payments?.recent?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {d.payments.recent.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#f8fafc', borderRadius: '8px',
                border: '1px solid #f1f5f9',
                animation: `fadeIn 0.2s ease ${i * 0.05}s both`,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{METHOD_ICONS[p.payment_method] || '💰'}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                      {p.receipt_number}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {p.payment_method?.replace(/_/g,' ')} •{' '}
                      {p.payment_date ? formatDistanceToNow(new Date(p.payment_date), { addSuffix: true }) : '—'}
                    </div>
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: '#1e8449', fontSize: '0.95rem' }}>{formatETB(p.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
            <p style={{ fontSize: '0.875rem' }}>No payments yet.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Submit and get a filing approved to make your first payment.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
