import React from 'react';

export function SkeletonLine({ width = '100%', height = '16px', style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 'var(--radius-sm)', ...style }} />;
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--gray-200)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <SkeletonLine width="42%" height="12px" style={{ marginBottom: '12px' }} />
          <SkeletonLine width="65%" height="32px" style={{ marginBottom: '10px' }} />
          <SkeletonLine width="50%" height="12px" />
        </div>
        <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, marginLeft: '1rem' }} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1rem', padding: '0.9rem 1.1rem',
        background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)',
        marginBottom: '0.25rem',
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} height="11px" width="65%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '1rem', padding: '1rem 1.1rem',
          borderBottom: '1px solid var(--gray-100)',
        }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} height="14px" width={c === 0 ? '80%' : '60%'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in">
      <SkeletonLine width="220px" height="30px" style={{ marginBottom: '10px' }} />
      <SkeletonLine width="320px" height="16px" style={{ marginBottom: '28px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--gray-200)' }}>
        <SkeletonTable />
      </div>
    </div>
  );
}
