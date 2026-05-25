import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taxFilingAPI } from '../api/taxFiling';

const TYPE_CONFIG = {
  info:        { bg: '#dbeafe', border: '#93c5fd', color: '#1d4ed8', icon: 'ℹ️' },
  warning:     { bg: '#fef3c7', border: '#fcd34d', color: '#b45309', icon: '⚠️' },
  maintenance: { bg: '#f3e8ff', border: '#c4b5fd', color: '#6b21a8', icon: '🔧' },
  deadline:    { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b', icon: '⏰' },
  urgent:      { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', icon: '🚨' },
};

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(new Set());

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => taxFilingAPI.announcements().then(r => r.data?.results || r.data || []),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  const visible = (announcements || []).filter(a => !dismissed.has(a.id));
  if (!visible.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
      {visible.map(ann => {
        const cfg = TYPE_CONFIG[ann.announcement_type] || TYPE_CONFIG.info;
        return (
          <div
            key={ann.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.875rem 1.1rem',
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 'var(--radius-lg)',
              animation: 'fadeInDown 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '1px' }}>{cfg.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: cfg.color, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>
                {ann.title}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: cfg.color, opacity: 0.85, lineHeight: 1.5 }}>
                {ann.message}
              </div>
            </div>
            <button
              onClick={() => setDismissed(prev => new Set([...prev, ann.id]))}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: cfg.color, opacity: 0.6, fontSize: '1rem',
                padding: '0.2rem', flexShrink: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
