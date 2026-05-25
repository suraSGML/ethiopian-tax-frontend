import React from 'react';

const variants = {
  primary:   { background: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)', color: '#fff', border: 'none', shadow: '0 3px 10px rgba(26,82,118,0.3)' },
  secondary: { background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px solid var(--gray-200)', shadow: 'none' },
  success:   { background: 'linear-gradient(135deg, #1e8449 0%, #27ae60 100%)', color: '#fff', border: 'none', shadow: '0 3px 10px rgba(30,132,73,0.3)' },
  danger:    { background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)', color: '#fff', border: 'none', shadow: '0 3px 10px rgba(192,57,43,0.3)' },
  warning:   { background: 'linear-gradient(135deg, #d68910 0%, #f39c12 100%)', color: '#fff', border: 'none', shadow: '0 3px 10px rgba(214,137,16,0.3)' },
  outline:   { background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', shadow: 'none' },
  ghost:     { background: 'transparent', color: 'var(--gray-500)', border: 'none', shadow: 'none' },
  white:     { background: '#fff', color: 'var(--primary)', border: '1px solid var(--gray-200)', shadow: 'var(--shadow-xs)' },
};

const sizes = {
  xs: { padding: '0.3rem 0.7rem',   fontSize: 'var(--text-xs)',  borderRadius: 'var(--radius-sm)', gap: '0.3rem' },
  sm: { padding: '0.45rem 0.9rem',  fontSize: 'var(--text-sm)',  borderRadius: 'var(--radius)',    gap: '0.4rem' },
  md: { padding: '0.65rem 1.35rem', fontSize: 'var(--text-base)',borderRadius: 'var(--radius)',    gap: '0.5rem' },
  lg: { padding: '0.85rem 1.75rem', fontSize: 'var(--text-lg)',  borderRadius: 'var(--radius-lg)', gap: '0.5rem' },
  xl: { padding: '1rem 2.25rem',    fontSize: 'var(--text-xl)',  borderRadius: 'var(--radius-lg)', gap: '0.6rem' },
};

export default function Button({
  children, variant = 'primary', size = 'md',
  disabled, loading, onClick, type = 'button',
  style, fullWidth, icon, iconRight,
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-ripple"
      style={{
        background: v.background,
        color: v.color,
        border: v.border,
        boxShadow: v.shadow,
        padding: s.padding,
        fontSize: s.fontSize,
        borderRadius: s.borderRadius,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        width: fullWidth ? '100%' : 'auto',
        transition: 'var(--transition)',
        transform: 'translateY(0)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        fontFamily: 'inherit',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = variant === 'primary' ? '0 6px 18px rgba(26,82,118,0.4)' :
            variant === 'success' ? '0 6px 18px rgba(30,132,73,0.4)' :
            variant === 'danger'  ? '0 6px 18px rgba(192,57,43,0.4)' :
            variant === 'outline' ? '0 4px 12px rgba(26,82,118,0.15)' :
            variant === 'secondary' ? 'var(--shadow-sm)' : 'none';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = v.shadow;
      }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {loading ? (
        <span style={{
          width: '16px', height: '16px',
          border: '2.5px solid rgba(255,255,255,0.35)',
          borderTopColor: variant === 'secondary' || variant === 'outline' || variant === 'ghost' ? 'var(--primary)' : '#fff',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
          flexShrink: 0,
        }} />
      ) : icon ? (
        <span style={{ fontSize: '1em', flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ fontSize: '1em', flexShrink: 0, lineHeight: 1 }}>{iconRight}</span>
      )}
    </button>
  );
}
