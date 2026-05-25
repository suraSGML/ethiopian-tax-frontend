import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { Card, StatCard } from '../../components/ui/Card';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 0 })}`;

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: revenue, isLoading } = useQuery({
    queryKey: ['revenue-report', year],
    queryFn: () => dashboardAPI.revenueReport(year).then(r => r.data),
  });

  const monthlyChart = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{
      label: `Revenue ${year} (ETB)`,
      data: revenue?.monthly_revenue?.map(m => m.revenue) || Array(12).fill(0),
      backgroundColor: 'rgba(26, 82, 118, 0.8)',
      borderRadius: 6,
    }],
  };

  const taxTypeColors = ['#1a5276','#2e86c1','#1e8449','#d68910','#c0392b'];
  const taxTypeChart = revenue?.by_tax_type ? {
    labels: revenue.by_tax_type.map(t => t.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())),
    datasets: [{
      data: revenue.by_tax_type.map(t => t.total),
      backgroundColor: taxTypeColors,
      borderWidth: 0,
    }],
  } : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Revenue Reports</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Annual tax collection analytics</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' }}
        >
          {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Annual Revenue" value={formatETB(revenue?.total_annual)} icon="💰" color="#1e8449" />
        <StatCard title="Tax Types Filed" value={revenue?.by_tax_type?.length || 0} icon="📋" color="#1a5276" />
        <StatCard title="Peak Month" value={
          revenue?.monthly_revenue
            ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][
                revenue.monthly_revenue.reduce((max, m, i, arr) => m.revenue > arr[max].revenue ? i : max, 0)
              ]
            : '—'
        } icon="📈" color="#d68910" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Monthly bar chart */}
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Monthly Revenue Breakdown</h3>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <Bar data={monthlyChart} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { callback: v => `ETB ${(v/1000).toFixed(0)}K` } } },
            }} />
          )}
        </Card>

        {/* Tax type donut */}
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Revenue by Tax Type</h3>
          {taxTypeChart ? (
            <Doughnut data={taxTypeChart} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
            }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No data</div>
          )}
        </Card>
      </div>

      {/* Tax type breakdown table */}
      {revenue?.by_tax_type && (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Revenue by Tax Type</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Tax Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Filings</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Total Collected</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {revenue.by_tax_type.map((t, i) => {
                const pct = revenue.total_annual > 0 ? (t.total / revenue.total_annual * 100).toFixed(1) : 0;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', color: '#1e293b', fontWeight: 500 }}>
                      {t.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>{t.count}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#1e8449' }}>{formatETB(t.total)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
