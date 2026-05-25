import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taxFilingAPI } from '../api/taxFiling';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft:        { icon: '📝', color: '#64748b', bg: '#f1f5f9' },
  submitted:    { icon: '📤', color: '#1d4ed8', bg: '#dbeafe' },
  under_review: { icon: '🔍', color: '#b45309', bg: '#fef3c7' },
  approved:     { icon: '✅', color: '#065f46', bg: '#d1fae5' },
  rejected:     { icon: '❌', color: '#991b1b', bg: '#fee2e2' },
  paid:         { icon: '💰', color: '#065f46', bg: '#d1fae5' },
  overdue:      { icon: '⚠️', color: '#991b1b', bg: '#fee2e2' },
  amended:      { icon: '📝', color: '#6b21a8', bg: '#f3e8ff' },
  appealed:     { icon: '⚖️', color: '#1d4ed8', bg: '#dbeafe' },
  cancelled:    { icon: '🚫', color: '#64748b', bg: '#f1f5f9' },
};

const ROLE_LABELS = {
  taxpayer:    'Taxpayer',
  tax_officer: 'Tax Officer',
  super_admin: 'System Admin',
  system:      'System',
};

export default function FilingTimeline({ filingId }) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['filing-history', filingId],
    queryFn: () => taxFilingAPI.history(filingId).then(r => r.data),
    enabled: !!filingId,
  });

  if (isLoading) return (
    <div style={{ padding: '1rem', color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>
      Loading history...
    </div>
  );

  if (!history || history.length === 0) return (
    <div style={{ padding: '1rem', color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>
      No history available.
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: '19px',
        top: '20px',
        bottom: '20px',
        width: '2px',
        background: 'var(--gray-200)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {history.map((entry, i) => {
          const config = STATUS_CONFIG[entry.to_status] || STATUS_CONFIG.draft;
          const isLast = i === history.length - 1;

          return (
            <div
              key={entry.id || i}
              style={{
                display: 'flex',
                gap: '1rem',
                paddingBottom: isLast ? 0 : '1.25rem',
                animation: `fadeIn 0.3s ease ${i * 0.06}s both`,
              }}
            >
              {/* Icon */}
              <div style={{
                width: '40px', height: '40px', flexShrink: 0,
                background: config.bg,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
                border: `2px solid ${config.color}30`,
                position: 'relative',
                zIndex: 1,
              }}>
                {config.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: config.color, fontSize: 'var(--text-sm)' }}>
                      {entry.to_status?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                    </span>
                    {entry.from_status && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>
                        (from {entry.from_status?.replace(/_/g,' ')})
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                    {format(new Date(entry.timestamp), 'dd MMM yyyy HH:mm')}
                  </span>
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '2px' }}>
                  By <strong>{entry.changed_by_name}</strong>
                  {entry.changed_by_role && (
                    <span style={{
                      marginLeft: '0.4rem',
                      background: 'var(--gray-100)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                    }}>
                      {ROLE_LABELS[entry.changed_by_role] || entry.changed_by_role}
                    </span>
                  )}
                </div>

                {entry.reason && (
                  <div style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.75rem',
                    background: config.bg,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    color: config.color,
                    lineHeight: 1.5,
                    borderLeft: `2px solid ${config.color}40`,
                  }}>
                    {entry.reason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
