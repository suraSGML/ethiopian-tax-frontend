import React, { useState } from 'react';

const baseInputStyle = (focused, error, disabled) => ({
  width: '100%',
  padding: '0.7rem 1rem',
  border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary-light)' : 'var(--gray-300)'}`,
  borderRadius: 'var(--radius)',
  fontSize: 'var(--text-base)',
  color: 'var(--gray-800)',
  background: disabled ? 'var(--gray-50)' : '#fff',
  outline: 'none',
  transition: 'var(--transition)',
  boxShadow: focused && !error ? '0 0 0 3px rgba(46,134,193,0.14)' :
             error ? '0 0 0 3px rgba(192,57,43,0.12)' : 'none',
  fontFamily: 'inherit',
  lineHeight: 1.5,
});

const labelStyle = (focused) => ({
  display: 'block',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: focused ? 'var(--primary)' : 'var(--gray-700)',
  marginBottom: '0.45rem',
  transition: 'color 0.2s',
  lineHeight: 1.4,
});

export default function Input({
  label, error, type = 'text', placeholder, value,
  onChange, name, required, disabled, hint,
  prefix, suffix, autoComplete, ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label style={labelStyle(focused)}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: '0.85rem',
            color: focused ? 'var(--primary-light)' : 'var(--gray-400)',
            fontSize: 'var(--text-base)',
            pointerEvents: 'none',
            transition: 'color 0.2s',
            zIndex: 1,
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...baseInputStyle(focused, error, disabled),
            paddingLeft: prefix ? '2.5rem' : '1rem',
            paddingRight: suffix ? '2.5rem' : '1rem',
          }}
          {...props}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: '0.85rem',
            color: 'var(--gray-400)', fontSize: 'var(--text-base)',
            pointerEvents: 'none',
          }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.4 }}>
          <span style={{ fontSize: '0.85em' }}>ℹ</span> {hint}
        </p>
      )}
      {error && (
        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--danger)', marginTop: '0.35rem',
          display: 'flex', alignItems: 'center', gap: '4px',
          animation: 'fadeIn 0.2s ease', lineHeight: 1.4,
        }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export function Select({ label, error, children, value, onChange, name, required, disabled, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <label style={labelStyle(focused)}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>}
      <select
        name={name} value={value} onChange={onChange}
        disabled={disabled} required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseInputStyle(focused, error, disabled),
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%2394a3b8' d='M7 9.5L2 4.5h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.9rem center',
          paddingRight: '2.5rem',
        }}
      >
        {children}
      </select>
      {hint && !error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: '0.35rem' }}>ℹ {hint}</p>}
      {error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)', marginTop: '0.35rem' }}>⚠ {error}</p>}
    </div>
  );
}

export function Textarea({ label, error, value, onChange, name, required, disabled, hint, rows = 4, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <label style={labelStyle(focused)}>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>}
      <textarea
        name={name} value={value} onChange={onChange}
        disabled={disabled} required={required}
        rows={rows} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseInputStyle(focused, error, disabled),
          resize: 'vertical',
          minHeight: `${rows * 1.6 + 1.4}rem`,
        }}
      />
      {hint && !error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: '0.35rem' }}>ℹ {hint}</p>}
      {error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)', marginTop: '0.35rem' }}>⚠ {error}</p>}
    </div>
  );
}
