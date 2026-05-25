import React from 'react';

const statusColors = {
  // Filing statuses
  draft:        { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  submitted:    { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  under_review: { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  approved:     { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  rejected:     { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  paid:         { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  overdue:      { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  // Payment statuses
  pending:      { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  processing:   { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  completed:    { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  failed:       { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  refunded:     { bg: '#f3e8ff', color: '#6b21a8', dot: '#a855f7' },
  cancelled:    { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  // Severity
  low:          { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  medium:       { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  high:         { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  critical:     { bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
  // Alert status
  open:         { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  investigating:{ bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  resolved:     { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  false_positive:{ bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  // Roles
  taxpayer:     { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  tax_officer:  { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  super_admin:  { bg: '#f3e8ff', color: '#6b21a8', dot: '#a855f7' },
};

export default function Badge({ status, label, size = 'md', dot = true }) {
  const colors = statusColors[status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  const text = label || status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const fontSize = size === 'sm' ? 'var(--text-xs)' : size === 'lg' ? 'var(--text-base)' : 'var(--text-sm)';
  const padding  = size === 'sm' ? '0.2rem 0.55rem' : size === 'lg' ? '0.4rem 1rem' : '0.28rem 0.7rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding,
      borderRadius: 'var(--radius-full)',
      fontSize,
      fontWeight: 600,
      background: colors.bg,
      color: colors.color,
      whiteSpace: 'nowrap',
      lineHeight: 1.4,
    }}>
      {dot && (
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: colors.dot,
          flexShrink: 0,
          display: 'inline-block',
        }} />
      )}
      {text}
    </span>
  );
}
