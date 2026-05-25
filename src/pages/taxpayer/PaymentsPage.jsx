import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { paymentsAPI } from '../../api/payments';
import { Card, StatCard } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonTable } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

const METHOD_ICONS = {
  commercial_bank: '🏦', awash_bank: '🏦', dashen_bank: '🏦',
  bank_transfer: '🏦', telebirr: '📱', mpesa: '📱', amole: '💳', cash: '💵',
};

export default function PaymentsPage() {
  const [downloading, setDownloading] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.list().then(r => r.data),
  });

  const payments = data?.results || [];
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;

  const downloadReceipt = async (id, receiptNumber) => {
    setDownloading(id);
    try {
      const res = await paymentsAPI.getReceiptPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receiptNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded.');
    } catch {
      toast.error('Could not download receipt.');
    } finally {
      setDownloading(null);
    }
  };

  const columns = [
    {
      header: 'Receipt #', key: 'receipt_number',
      render: v => v ? (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#1a5276' }}>{v}</span>
      ) : <span style={{ color: '#94a3b8' }}>—</span>
    },
    { header: 'Filing Ref', key: 'filing_reference', render: v => <span style={{ fontSize: '0.8rem' }}>{v || '—'}</span> },
    {
      header: 'Method', key: 'payment_method',
      render: v => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
          <span>{METHOD_ICONS[v] || '💰'}</span>
          {v?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
        </span>
      )
    },
    { header: 'Amount', key: 'amount', render: v => <span style={{ fontWeight: 700, color: '#1e8449' }}>{formatETB(v)}</span>, align: 'right' },
    { header: 'Status', key: 'status', render: v => <Badge status={v} /> },
    {
      header: 'Date', key: 'payment_date',
      render: v => v ? (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{format(new Date(v), 'dd MMM yyyy')}</span>
      ) : '—'
    },
    {
      header: 'Actions', key: 'id',
      render: (v, row) => row.status === 'completed' ? (
        <Button
          size="xs" variant="outline"
          loading={downloading === v}
          onClick={() => downloadReceipt(v, row.receipt_number)}
          icon="📄"
        >
          Receipt
        </Button>
      ) : (
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {row.status === 'failed' ? '❌ Failed' : '⏳ Pending'}
        </span>
      )
    },
  ];

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: 'Payments' }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Payment History</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>All your tax payments and receipts</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Paid" value={formatETB(totalPaid)} icon="💰" color="#1e8449" loading={isLoading} />
        <StatCard title="Completed" value={completedCount} icon="✅" color="#1a5276" loading={isLoading} />
        <StatCard title="Pending" value={pendingCount} icon="⏳" color="#d97706" loading={isLoading} />
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
            {payments.length} payment(s)
          </span>
        </div>
        {isLoading ? (
          <div style={{ padding: '1rem' }}><SkeletonTable rows={4} cols={6} /></div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
            <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>No payments yet</p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Once your filing is approved, you can make a payment.
            </p>
            <Link to="/filings">
              <Button variant="outline">View My Filings</Button>
            </Link>
          </div>
        ) : (
          <Table columns={columns} data={payments} />
        )}
      </Card>
    </div>
  );
}
