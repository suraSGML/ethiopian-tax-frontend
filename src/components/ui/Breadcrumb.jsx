import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.4rem' }}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', listStyle: 'none', flexWrap: 'wrap' }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {i > 0 && <span style={{ color: 'var(--gray-300)', fontSize: 'var(--text-sm)' }}>›</span>}
              {isLast || !item.href ? (
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: isLast ? 'var(--gray-700)' : 'var(--gray-500)',
                  fontWeight: isLast ? 600 : 400,
                }}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--gray-500)',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
