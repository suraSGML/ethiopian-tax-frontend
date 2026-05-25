import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { paymentsAPI } from '../../api/payments';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { value: 'commercial_bank', label: 'Commercial Bank of Ethiopia', icon: '🏦', desc: 'Direct bank transfer', color: '#1a5276' },
  { value: 'awash_bank',      label: 'Awash Bank',                  icon: '🏦', desc: 'Awash Bank transfer', color: '#1a5276' },
  { value: 'dashen_bank',     label: 'Dashen Bank',                 icon: '🏦', desc: 'Dashen Bank transfer', color: '#1a5276' },
  { value: 'telebirr',        label: 'TeleBirr',                    icon: '📱', desc: 'Ethio Telecom mobile money', color: '#e74c3c' },
  { value: 'amole',           label: 'Amole Digital Wallet',        icon: '💳', desc: 'Dashen Bank digital wallet', color: '#2e86c1' },
  { value: 'cash',            label: 'Cash at Tax Office',          icon: '💵', desc: 'Pay in person at MOR office', color: '#1e8449' },
];

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function PaymentPage() {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState('');
  const [phone, setPhone] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(null);

  const { data: filing, isLoading } = useQuery({
    queryKey: ['filing', filingId],
    queryFn: () => taxFilingAPI.get(filingId).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => paymentsAPI.initiate(data),
    onSuccess: (res) => {
      setSuccess(res.data);
      setShowConfirm(false);
      toast.success('Payment processed successfully!');
    },
    onError: (err) => {
      setShowConfirm(false);
      toast.error(err.response?.data?.error || 'Payment failed. Please try again.');
    },
  });

  const handlePay = () => {
    if (!method) { toast.error('Please select a payment method.'); return; }
    if (['telebirr','mpesa','amole'].includes(method) && !phone) {
      toast.error('Please enter your mobile number.'); return;
    }
    setShowConfirm(true);
  };

  const confirmPay = () => {
    mutation.mutate({
      tax_filing_id: filingId,
      payment_method: method,
      amount: filing.balance_due,
      phone_number: phone,
    });
  };

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
      <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-base)' }}>Loading filing details...</p>
    </div>
  );

  if (!filing) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <p style={{ color: 'var(--gray-500)' }}>Filing not found.</p>
      <Button variant="outline" onClick={() => navigate('/filings')} style={{ marginTop: '1rem' }}>Back to Filings</Button>
    </div>
  );

  // Success screen
  if (success) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto' }} className="animate-bounce-in">
        <Card padding="2.5rem" style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'var(--success-light)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1.5rem',
          }}>
            ✅
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: 'var(--text-base)' }}>
            Your tax payment has been processed and recorded.
          </p>

          <div style={{
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            {[
              { label: 'Receipt Number',  value: success.receipt_number, mono: true },
              { label: 'Transaction ID',  value: success.transaction_id, mono: true },
              { label: 'Amount Paid',     value: formatETB(success.amount), bold: true, color: 'var(--success)' },
              { label: 'Payment Status',  value: success.status?.toUpperCase() },
              { label: 'Date',            value: format(new Date(), 'dd MMMM yyyy HH:mm') },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.65rem 0',
                borderBottom: i < 4 ? '1px solid var(--gray-200)' : 'none',
                fontSize: 'var(--text-base)',
              }}>
                <span style={{ color: 'var(--gray-500)' }}>{item.label}</span>
                <span style={{
                  fontWeight: item.bold ? 800 : 600,
                  color: item.color || 'var(--gray-800)',
                  fontFamily: item.mono ? 'monospace' : 'inherit',
                  fontSize: item.bold ? 'var(--text-lg)' : 'var(--text-base)',
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => navigate('/payments')} style={{ flex: 1 }}>
              📄 View Payments
            </Button>
            <Button onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
              🏠 Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === method);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }} className="animate-fade-in">
      <Breadcrumb items={[
        { label: 'Filings', href: '/filings' },
        { label: filing.reference_number, href: `/filings/${filingId}` },
        { label: 'Make Payment' },
      ]} />

      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--gray-800)' }}>
        Make Payment
      </h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.75rem', fontSize: 'var(--text-base)' }}>
        Complete your tax payment securely
      </p>

      {/* Filing summary */}
      <Card style={{
        marginBottom: '1.25rem',
        background: 'linear-gradient(135deg, var(--primary-50), #fff)',
        border: '1.5px solid var(--primary-100)',
      }} padding="1.5rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Filing Reference
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--text-lg)' }}>
              {filing.reference_number}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {filing.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} • {filing.fiscal_year}
              <Badge status={filing.status} size="sm" />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Balance Due
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em' }}>
              {formatETB(filing.balance_due)}
            </div>
          </div>
        </div>
      </Card>

      {/* Payment method selection */}
      <Card padding="1.5rem" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.1rem', color: 'var(--gray-800)', fontSize: 'var(--text-lg)' }}>
          Select Payment Method
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {PAYMENT_METHODS.map(m => (
            <div
              key={m.value}
              onClick={() => setMethod(m.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.1rem',
                border: `2px solid ${method === m.value ? 'var(--primary)' : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                background: method === m.value ? 'var(--primary-50)' : '#fff',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => { if (method !== m.value) { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; } }}
              onMouseLeave={e => { if (method !== m.value) { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = '#fff'; } }}
            >
              <div style={{
                width: '44px', height: '44px', flexShrink: 0,
                background: method === m.value ? `${m.color}18` : 'var(--gray-100)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
                transition: 'var(--transition)',
              }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 'var(--text-base)', lineHeight: 1.3 }}>{m.label}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: '2px' }}>{m.desc}</div>
              </div>
              <div style={{
                width: '22px', height: '22px', flexShrink: 0,
                borderRadius: '50%',
                border: `2px solid ${method === m.value ? 'var(--primary)' : 'var(--gray-300)'}`,
                background: method === m.value ? 'var(--primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--transition)',
              }}>
                {method === m.value && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Mobile number for mobile money */}
      {['telebirr','mpesa','amole'].includes(method) && (
        <Card padding="1.5rem" style={{ marginBottom: '1.25rem', animation: 'slideDown 0.2s ease' }}>
          <Input
            label="Mobile Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+251 9XX XXX XXXX"
            hint="Enter the number linked to your mobile wallet"
            prefix="📱"
            required
          />
        </Card>
      )}

      {/* Security notice */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #bbf7d0',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>🔒</span>
        <div>
          <div style={{ fontWeight: 700, color: '#166534', fontSize: 'var(--text-sm)', marginBottom: '2px' }}>
            Secure Payment
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: '#15803d', lineHeight: 1.5 }}>
            Your payment is protected by 256-bit SSL encryption. This is an official Ministry of Revenue payment portal.
          </div>
        </div>
      </div>

      <Button
        fullWidth size="lg"
        onClick={handlePay}
        disabled={!method}
        icon="💳"
      >
        Pay {formatETB(filing.balance_due)}
      </Button>

      {/* Confirmation modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Payment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={mutation.isPending}>Cancel</Button>
            <Button onClick={confirmPay} loading={mutation.isPending} icon="💳">
              Confirm & Pay
            </Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
            {selectedMethod?.icon}
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em' }}>
            {formatETB(filing.balance_due)}
          </div>
          <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-base)', marginTop: '0.4rem' }}>
            via {selectedMethod?.label}
          </div>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          {[
            { label: 'Filing', value: filing.reference_number },
            { label: 'Tax Type', value: filing.tax_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) },
            { label: 'Fiscal Year', value: filing.fiscal_year },
            ...(phone ? [{ label: 'Mobile', value: phone }] : []),
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: i < 2 ? '1px solid var(--gray-200)' : 'none', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--gray-500)' }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
          By confirming, you authorize this payment to the Ethiopian Ministry of Revenue.
        </p>
      </Modal>
    </div>
  );
}
