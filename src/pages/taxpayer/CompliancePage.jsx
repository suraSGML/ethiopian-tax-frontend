import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taxFilingAPI } from '../../api/taxFiling';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const GRADE_CONFIG = {
  A: { color: '#065f46', bg: '#d1fae5', label: 'Excellent', icon: '🏆' },
  B: { color: '#1d4ed8', bg: '#dbeafe', label: 'Good',      icon: '✅' },
  C: { color: '#b45309', bg: '#fef3c7', label: 'Fair',      icon: '⚠️' },
  D: { color: '#c0392b', bg: '#fee2e2', label: 'Poor',      icon: '❌' },
  F: { color: '#9d174d', bg: '#fce7f3', label: 'Non-Compliant', icon: '🚫' },
};

export default function CompliancePage() {
  const { data: compliance, isLoading: compLoading } = useQuery({
    queryKey: ['my-compliance'],
    queryFn: () => taxFilingAPI.myCompliance().then(r => r.data),
  });

  const { data: certs, isLoading: certsLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => taxFilingAPI.listCertificates().then(r => r.data?.results || r.data || []),
  });

  if (compLoading) return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    </div>
  );

  const c = compliance || {};
  const grade = GRADE_CONFIG[c.grade] || GRADE_CONFIG.C;
  const activeCert = certs?.find(cert => cert.is_valid && !cert.is_expired);

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: 'Compliance Status' }]} />

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-800)' }}>
          Tax Compliance Status
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-base)' }}>
          Your compliance record with the Ethiopian Ministry of Revenue
        </p>
      </div>

      {/* Compliance score card */}
      <Card padding="2rem" style={{ marginBottom: '1.5rem', background: `linear-gradient(135deg, ${grade.bg}, #fff)`, border: `1.5px solid ${grade.color}20` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Compliance Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '4rem', fontWeight: 900, color: grade.color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                {c.score}
              </span>
              <span style={{ fontSize: 'var(--text-xl)', color: 'var(--gray-400)', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{grade.icon}</span>
              <span style={{ fontWeight: 700, color: grade.color, fontSize: 'var(--text-lg)' }}>
                Grade {c.grade} — {grade.label}
              </span>
            </div>
          </div>

          {/* Score gauge */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--gray-200)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={grade.color} strokeWidth="10"
                  strokeDasharray={`${(c.score / 100) * 314} 314`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-xl)', fontWeight: 800, color: grade.color,
              }}>
                {c.grade}
              </div>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ marginTop: '1.5rem' }}>
          <div className="progress-bar" style={{ height: '10px' }}>
            <div className="progress-bar-fill" style={{
              width: `${c.score}%`,
              background: `linear-gradient(90deg, ${grade.color}, ${grade.color}aa)`,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>
            <span>0 — Non-Compliant</span>
            <span>75 — Certificate Eligible</span>
            <span>100 — Perfect</span>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Filings" value={c.total_filings || 0} icon="📋" color="var(--primary)" />
        <StatCard title="Paid On Time" value={c.paid_filings || 0} icon="✅" color="var(--success)" />
        <StatCard title="Overdue" value={c.overdue_filings || 0} icon="⚠️" color="var(--warning)" />
        <StatCard title="Late Submissions" value={c.late_submissions || 0} icon="⏰" color="var(--danger)" />
      </div>

      {/* Certificate section */}
      <Card padding="1.75rem" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: 'var(--text-lg)', color: 'var(--gray-800)' }}>
          🏆 Tax Compliance Certificate
        </h3>

        {activeCert ? (
          <div style={{
            background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '20%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  Tax Compliance Certificate
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {activeCert.certificate_number}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.75, marginTop: '0.4rem' }}>
                  Fiscal Year {activeCert.fiscal_year}
                </div>
              </div>
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🇪🇹</div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>Issued</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  {format(new Date(activeCert.issued_at), 'dd MMM yyyy')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>Valid Until</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  {format(new Date(activeCert.valid_until), 'dd MMM yyyy')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>Issued By</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  {activeCert.issued_by_name || 'Ministry of Revenue'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button
                variant="white"
                size="sm"
                icon="📄"
                onClick={() => {
                  navigator.clipboard?.writeText(activeCert.certificate_number);
                  toast.success('Certificate number copied!');
                }}
              >
                Copy Certificate Number
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '1.5rem',
              background: c.certificate_eligible ? '#f0fdf4' : 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${c.certificate_eligible ? '#86efac' : 'var(--gray-200)'}`,
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{c.certificate_eligible ? '✅' : '❌'}</span>
                <div style={{ fontWeight: 700, color: c.certificate_eligible ? 'var(--success)' : 'var(--danger)', fontSize: 'var(--text-base)' }}>
                  {c.certificate_eligible ? 'You are eligible for a compliance certificate' : 'Not yet eligible'}
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                {c.certificate_reason}
              </p>
            </div>

            {/* Requirements checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                Certificate Requirements:
              </div>
              {[
                { label: 'Compliance score ≥ 75', met: c.score >= 75 },
                { label: 'No overdue filings', met: (c.overdue_filings || 0) === 0 },
                { label: 'No outstanding balance', met: c.certificate_eligible || false },
              ].map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: req.met ? 'var(--success)' : 'var(--danger)', fontSize: '1rem' }}>
                    {req.met ? '✓' : '✗'}
                  </span>
                  <span style={{ color: req.met ? 'var(--gray-700)' : 'var(--gray-500)' }}>{req.label}</span>
                </div>
              ))}
            </div>

            {c.certificate_eligible && (
              <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #86efac', fontSize: 'var(--text-sm)', color: '#166534' }}>
                ℹ You are eligible. Contact your assigned tax officer or visit the nearest MOR office to request your certificate.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Certificate history */}
      {certs && certs.length > 0 && (
        <Card padding="1.75rem">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: 'var(--text-lg)', color: 'var(--gray-800)' }}>
            Certificate History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certs.map((cert, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1rem',
                background: cert.is_valid && !cert.is_expired ? '#f0fdf4' : 'var(--gray-50)',
                borderRadius: 'var(--radius)',
                border: `1px solid ${cert.is_valid && !cert.is_expired ? '#86efac' : 'var(--gray-200)'}`,
              }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>
                    {cert.certificate_number}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '2px' }}>
                    FY {cert.fiscal_year} • Issued {format(new Date(cert.issued_at), 'dd MMM yyyy')} • Valid until {format(new Date(cert.valid_until), 'dd MMM yyyy')}
                  </div>
                </div>
                <Badge
                  status={cert.is_valid && !cert.is_expired ? 'approved' : 'cancelled'}
                  label={cert.is_valid && !cert.is_expired ? 'Active' : cert.is_expired ? 'Expired' : 'Revoked'}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
