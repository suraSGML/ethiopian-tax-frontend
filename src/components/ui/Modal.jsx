import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: '440px', md: '560px', lg: '740px', xl: '960px' };

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: widths[size] || widths.md,
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 70px rgba(0,0,0,0.22)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.4rem 1.75rem',
          borderBottom: '1px solid var(--gray-100)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <h3 style={{ fontWeight: 800, color: 'var(--gray-800)', fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'var(--gray-100)',
              border: 'none',
              borderRadius: '8px',
              width: '34px', height: '34px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--text-base)', color: 'var(--gray-500)',
              transition: 'var(--transition)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-800)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, fontSize: 'var(--text-base)', color: 'var(--gray-800)' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '1.1rem 1.75rem',
            borderTop: '1px solid var(--gray-100)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexShrink: 0,
            background: 'var(--gray-50)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger', loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-base)', lineHeight: 1.65 }}>{message}</p>
    </Modal>
  );
}
