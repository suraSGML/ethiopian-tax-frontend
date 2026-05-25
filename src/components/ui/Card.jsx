import React from 'react';

export function Card({ children, style, className, hover = false, onClick, animate = true, padding = '1.75rem' }) {
  return (
    <div
      onClick={onClick}
      className={`${animate ? 'animate-fade-in' : ''} ${hover ? 'card-hover' : ''} ${className || ''}`}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gray-200)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon, color = '#1a5276', trend, loading, onClick }) {
  if (loading) {
    return (
      <Card animate={false} padding="1.5rem">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: '13px', width: '55%', marginBottom: '14px' }} />
            <div className="skeleton" style={{ height: '34px', width: '75%', marginBottom: '10px' }} />
            <div className="skeleton" style={{ height: '11px', width: '45%' }} />
          </div>
          <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0 }} />
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{ position: 'relative', overflow: 'hidden' }}
      hover={!!onClick}
      onClick={onClick}
      padding="1.5rem"
    >
      {/* Decorative bg */}
      <div style={{
        position: 'absolute', top: '-24px', right: '-24px',
        width: '110px', height: '110px',
        background: `${color}0a`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', right: '20px',
        width: '80px', height: '80px',
        background: `${color}06`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--gray-500)',
            fontWeight: 600,
            marginBottom: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            color: 'var(--gray-800)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: '0.5rem',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', lineHeight: 1.4 }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: trend > 0 ? 'var(--success)' : 'var(--danger)',
              marginTop: '0.4rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div style={{
          width: '52px', height: '52px',
          background: `${color}18`,
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0,
          marginLeft: '1rem',
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
