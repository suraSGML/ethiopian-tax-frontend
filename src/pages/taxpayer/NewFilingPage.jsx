import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const TAX_TYPES = [
  { value: 'personal_income', label: 'Personal Income Tax', desc: 'For employed individuals' },
  { value: 'business_income', label: 'Business Income Tax', desc: '30% on net profit' },
  { value: 'vat', label: 'Value Added Tax (VAT)', desc: '15% on taxable sales' },
  { value: 'turnover', label: 'Turnover Tax (TOT)', desc: '2% or 10% on turnover' },
];

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function NewFilingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [form, setForm] = useState({
    tax_type: '', filing_period: 'annual', fiscal_year: new Date().getFullYear(),
    period_month: '', period_quarter: '',
    gross_income: '', allowable_deductions: '0',
    vat_collected: '0', vat_paid: '0',
    due_date: '',
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCalculate = async () => {
    setCalcLoading(true);
    try {
      const res = await taxFilingAPI.calculate({
        tax_type: form.tax_type,
        gross_income: form.gross_income || 0,
        allowable_deductions: form.allowable_deductions || 0,
        vat_collected: form.vat_collected || 0,
        vat_paid: form.vat_paid || 0,
      });
      setPreview(res.data);
      setStep(3);
    } catch (err) {
      toast.error('Calculation failed.');
    } finally {
      setCalcLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (data) => taxFilingAPI.create(data),
    onSuccess: (res) => {
      toast.success(`Filing created! Reference: ${res.data.reference_number}`);
      navigate(`/filings/${res.data.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to create filing.');
    },
  });

  const handleSubmit = () => {
    const payload = { ...form };
    if (form.filing_period !== 'monthly') delete payload.period_month;
    if (form.filing_period !== 'quarterly') delete payload.period_quarter;
    mutation.mutate(payload);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>New Tax Filing</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Complete the form to file your taxes</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['Select Type', 'Enter Data', 'Review & Submit'].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: '4px', borderRadius: '2px', marginBottom: '0.4rem',
              background: i + 1 <= step ? '#1a5276' : '#e2e8f0',
            }} />
            <span style={{ fontSize: '0.7rem', color: i + 1 <= step ? '#1a5276' : '#94a3b8', fontWeight: i + 1 === step ? 600 : 400 }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Select tax type */}
      {step === 1 && (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Select Tax Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {TAX_TYPES.map(t => (
              <div
                key={t.value}
                onClick={() => setForm(f => ({ ...f, tax_type: t.value }))}
                style={{
                  padding: '1rem',
                  border: `2px solid ${form.tax_type === t.value ? '#1a5276' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: form.tax_type === t.value ? '#eaf2ff' : '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{t.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Button fullWidth disabled={!form.tax_type} onClick={() => setStep(2)}>
              Continue →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Enter financial data */}
      {step === 2 && (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
            {TAX_TYPES.find(t => t.value === form.tax_type)?.label}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Filing Period" name="filing_period" value={form.filing_period} onChange={handleChange}>
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </Select>
            <Input label="Fiscal Year" type="number" name="fiscal_year" value={form.fiscal_year} onChange={handleChange} required />
          </div>

          {form.filing_period === 'monthly' && (
            <Select label="Month" name="period_month" value={form.period_month} onChange={handleChange} required>
              <option value="">Select month</option>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </Select>
          )}
          {form.filing_period === 'quarterly' && (
            <Select label="Quarter" name="period_quarter" value={form.period_quarter} onChange={handleChange} required>
              <option value="">Select quarter</option>
              {[1,2,3,4].map(q => <option key={q} value={q}>Q{q}</option>)}
            </Select>
          )}

          {form.tax_type === 'vat' ? (
            <>
              <Input label="Total Taxable Sales (ETB)" type="number" name="vat_collected" value={form.vat_collected} onChange={handleChange} hint="Sales before VAT" />
              <Input label="VAT Paid on Purchases (ETB)" type="number" name="vat_paid" value={form.vat_paid} onChange={handleChange} hint="Input tax credit" />
            </>
          ) : (
            <>
              <Input label={form.tax_type === 'personal_income' ? 'Monthly Gross Income (ETB)' : 'Gross Income / Turnover (ETB)'} type="number" name="gross_income" value={form.gross_income} onChange={handleChange} required />
              {form.tax_type === 'business_income' && (
                <Input label="Allowable Deductions (ETB)" type="number" name="allowable_deductions" value={form.allowable_deductions} onChange={handleChange} hint="Business expenses" />
              )}
            </>
          )}

          <Input label="Due Date" type="date" name="due_date" value={form.due_date} onChange={handleChange} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button loading={calcLoading} onClick={handleCalculate} style={{ flex: 1 }}>
              Calculate Tax →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && preview && (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Tax Calculation Summary</h3>
          <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            {Object.entries(preview).filter(([k]) => !k.includes('bracket') && !k.includes('error')).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e0f2fe' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>
                  {k.replace(/_/g, ' ')}
                </span>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                  {typeof v === 'number' ? (k.includes('rate') ? `${(v * 100).toFixed(1)}%` : formatETB(v)) : String(v)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: '#1a5276', color: '#fff', borderRadius: '10px', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Estimated Tax Due</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              {formatETB(preview.calculated_tax || preview.annual_tax || preview.net_vat_payable || 0)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>← Edit</Button>
            <Button variant="outline" onClick={handleSubmit} loading={mutation.isPending} style={{ flex: 1 }}>
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} loading={mutation.isPending} style={{ flex: 1 }}>
              Submit Filing
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
