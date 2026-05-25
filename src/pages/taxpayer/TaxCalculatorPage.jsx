import React, { useState } from 'react';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const formatETB = n => `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

export default function TaxCalculatorPage() {
  const [form, setForm] = useState({
    tax_type: 'personal_income', gross_income: '', allowable_deductions: '0',
    vat_collected: '0', vat_paid: '0', business_type: 'trade', days_overdue: '0',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await taxFilingAPI.calculate(form);
      setResult(res.data);
    } catch (err) {
      toast.error('Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const BRACKETS = [
    { range: '0 - 600', rate: '0%', deduction: '0' },
    { range: '601 - 1,650', rate: '10%', deduction: '60' },
    { range: '1,651 - 3,200', rate: '15%', deduction: '142.50' },
    { range: '3,201 - 5,250', rate: '20%', deduction: '302.50' },
    { range: '5,251 - 7,800', rate: '25%', deduction: '565' },
    { range: '7,801 - 10,900', rate: '30%', deduction: '955' },
    { range: '10,901+', rate: '35%', deduction: '1,500' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Tax Calculator</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Estimate your Ethiopian tax liability</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Calculator form */}
        <div>
          <Card>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Calculate Tax</h3>
            <Select label="Tax Type" name="tax_type" value={form.tax_type} onChange={handleChange}>
              <option value="personal_income">Personal Income Tax</option>
              <option value="business_income">Business Income Tax</option>
              <option value="vat">VAT (15%)</option>
              <option value="turnover">Turnover Tax (TOT)</option>
            </Select>

            {form.tax_type === 'vat' ? (
              <>
                <Input label="Taxable Sales (ETB)" type="number" name="vat_collected" value={form.vat_collected} onChange={handleChange} />
                <Input label="VAT Paid on Purchases (ETB)" type="number" name="vat_paid" value={form.vat_paid} onChange={handleChange} />
              </>
            ) : (
              <>
                <Input
                  label={form.tax_type === 'personal_income' ? 'Monthly Gross Income (ETB)' : 'Annual Gross Income / Turnover (ETB)'}
                  type="number" name="gross_income" value={form.gross_income} onChange={handleChange}
                />
                {form.tax_type === 'business_income' && (
                  <Input label="Allowable Deductions (ETB)" type="number" name="allowable_deductions" value={form.allowable_deductions} onChange={handleChange} />
                )}
                {form.tax_type === 'turnover' && (
                  <Select label="Business Type" name="business_type" value={form.business_type} onChange={handleChange}>
                    <option value="trade">Trade / Manufacturing (2%)</option>
                    <option value="service">Service (10%)</option>
                  </Select>
                )}
              </>
            )}

            <Input label="Days Overdue (for penalty calculation)" type="number" name="days_overdue" value={form.days_overdue} onChange={handleChange} hint="0 if not overdue" />

            <Button fullWidth onClick={handleCalculate} loading={loading}>Calculate</Button>
          </Card>

          {/* Result */}
          {result && (
            <Card style={{ marginTop: '1rem', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1a5276' }}>Calculation Result</h3>
              {Object.entries(result).filter(([k]) => k !== 'bracket' && k !== 'error' && typeof result[k] !== 'object').map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e0f2fe' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>
                    {k.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                    {typeof v === 'number'
                      ? (k.includes('rate') ? `${(v * 100).toFixed(1)}%` : formatETB(v))
                      : String(v)
                    }
                  </span>
                </div>
              ))}
              {result.penalty_details && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Penalty Details</div>
                  {Object.entries(result.penalty_details).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#7f1d1d' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ fontWeight: 600, color: '#991b1b' }}>{typeof v === 'number' ? formatETB(v) : v}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Tax brackets reference */}
        <div>
          <Card>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>
              Personal Income Tax Brackets (Monthly ETB)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#1a5276', color: '#fff' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Income Range</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Rate</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Deduction</th>
                </tr>
              </thead>
              <tbody>
                {BRACKETS.map((b, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '0.5rem', color: '#334155' }}>{b.range}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: '#1a5276' }}>{b.rate}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#64748b' }}>ETB {b.deduction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>Other Tax Rates</h3>
            {[
              { label: 'Business Income Tax', value: '30% on net profit' },
              { label: 'VAT', value: '15% on taxable sales' },
              { label: 'Turnover Tax (Trade)', value: '2% of annual turnover' },
              { label: 'Turnover Tax (Service)', value: '10% of annual turnover' },
              { label: 'Late Payment Penalty', value: '5% + 2%/month' },
              { label: 'VAT Registration Threshold', value: 'ETB 500,000/year' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: '#1a5276' }}>{item.value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
