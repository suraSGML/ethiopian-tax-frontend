import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../api/dashboard';
import { Card, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 0 })}`;

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardAPI.adminDashboard().then(r => r.data),
    refetchInterval: 60000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-report', new Date().getFullYear()],
    queryFn: () => dashboardAPI.revenueReport(new Date().getFullYear()).then(r => r.data),
  });

  if (isLoading) return <PageSkeleton />;

  const d = data || {};
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const barData = {
    labels: months,
    datasets: [{
      label: 'Revenue (ETB)',
      data: revenueData?.monthly_revenue?.map(m => m.revenue) || Array(12).fill(0),
      backgroundColor: months.map((_, i) => i === new Date().getMonth() ? '#f39c12' : 'rgba(26,82,118,0.75)'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const taxTypeColors = ['#1a5276','#2e86c1','#1e8449','#d68910','#c0392b'];
  const doughnutData = d.revenue?.by_tax_type?.length ? {
    labels: d.revenue.by_tax_type.map(t => t.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())),
    datasets: [{
      data: d.revenue.by_tax_type.map(t => t.total || 0),
      backgroundColor: taxTypeColors,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  } : null;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Ministry of Revenue — {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <Button variant="outline" size="sm" icon="🔄" onClick={() => window.location.reload()}>Refresh</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Revenue" value={formatETB(d.revenue?.total)} icon="💰" color="#1e8449"
          subtitle={`${formatETB(d.revenue?.last_30_days)} last 30 days`} />
        <StatCard title="Total Taxpayers" value={(d.taxpayers?.total || 0).toLocaleString()} icon="👥" color="#1a5276"
          subtitle={`${d.taxpayers?.new_this_month || 0} new this month`} />
        <StatCard title="Compliance Rate" value={`${d.filings?.compliance_rate || 0}%`} icon="📊" color="#2e86c1"
          subtitle={`${d.filings?.total || 0} total filings`} />
        <StatCard title="Open Fraud Alerts" value={d.fraud_alerts?.open || 0} icon="🚨" color="#c0392b"
          subtitle={`${d.fraud_alerts?.critical || 0} critical`} />
      </div>

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending Review', value: d.filings?.pending_review || 0, color: '#d97706', bg: '#fef3c7', href: '/admin/filings?status=submitted', icon: '📋' },
          { label: 'Overdue Filings', value: d.filings?.overdue || 0, color: '#c0392b', bg: '#fee2e2', href: '/admin/filings?status=overdue', icon: '⚠️' },
          { label: 'Unverified Users', value: (d.taxpayers?.total || 0) - (d.taxpayers?.verified || 0), color: '#7c3aed', bg: '#f3e8ff', href: '/admin/users', icon: '👤' },
          { label: 'Active Taxpayers', value: d.taxpayers?.active || 0, color: '#1e8449', bg: '#d1fae5', href: '/admin/users', icon: '✅' },
        ].map((item, i) => (
          <Link key={i} to={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: item.bg, borderRadius: '10px', padding: '1rem',
              border: `1px solid ${item.color}20`,
              transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{item.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.72rem', color: item.color, fontWeight: 600, opacity: 0.8 }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Revenue chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
              📈 Monthly Revenue {new Date().getFullYear()}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Total: {formatETB(revenueData?.total_annual)}
            </span>
          </div>
          <Bar data={barData} options={{
            responsive: true,
            plugins: { legend: { display: false }, tooltip: {
              callbacks: { label: ctx => `ETB ${ctx.raw.toLocaleString()}` }
            }},
            scales: {
              y: { beginAtZero: true, ticks: { callback: v => `${(v/1000).toFixed(0)}K`, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
              x: { ticks: { font: { size: 11 } }, grid: { display: false } },
            },
          }} />
        </Card>

        {/* Filing status + donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b', fontSize: '0.95rem' }}>Filing Status</h3>
            {d.filings?.by_status && Object.entries(d.filings.by_status).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f8fafc' }}>
                <Badge status={status} />
                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>{count}</span>
              </div>
            ))}
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/admin/filings"><Button variant="outline" size="sm" fullWidth>Manage Filings →</Button></Link>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Revenue by type */}
        {doughnutData && (
          <Card>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b', fontSize: '0.95rem' }}>Revenue by Tax Type</h3>
            <div style={{ maxWidth: '220px', margin: '0 auto' }}>
              <Doughnut data={doughnutData} options={{
                responsive: true,
                cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
              }} />
            </div>
          </Card>
        )}

        {/* Fraud alerts */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>🚨 Recent Fraud Alerts</h3>
            <Link to="/admin/fraud"><Button variant="ghost" size="sm">View All →</Button></Link>
          </div>
          {d.fraud_alerts?.recent?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {d.fraud_alerts.recent.map((a, i) => (
                <div key={i} style={{
                  padding: '0.75rem', background: '#fef2f2', borderRadius: '8px',
                  borderLeft: '3px solid #c0392b',
                  animation: `fadeIn 0.2s ease ${i * 0.05}s both`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991b1b' }}>
                      {a.alert_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                    </span>
                    <Badge status={a.severity} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{a['user__email']}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              <p style={{ fontSize: '0.875rem' }}>No open fraud alerts</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
