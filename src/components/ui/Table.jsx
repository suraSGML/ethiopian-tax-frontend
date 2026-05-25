import React from 'react';

export default function Table({ columns, data, loading, emptyMessage = 'No data found.', emptyIcon = '📭' }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid var(--gray-200)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{ fontSize: 'var(--text-base)', fontWeight: 500 }}>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="scroll-x">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-base)' }}>
        <thead>
          <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: '0.9rem 1.1rem',
                textAlign: col.align || 'left',
                fontWeight: 700,
                color: 'var(--gray-500)',
                fontSize: 'var(--text-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                whiteSpace: 'nowrap',
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{emptyIcon}</div>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 500 }}>{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className="table-row-hover"
                style={{
                  borderBottom: '1px solid var(--gray-100)',
                  animation: `fadeIn 0.2s ease ${Math.min(i * 0.04, 0.4)}s both`,
                }}
              >
                {columns.map((col, j) => (
                  <td key={j} style={{
                    padding: '1rem 1.1rem',
                    color: 'var(--gray-700)',
                    textAlign: col.align || 'left',
                    verticalAlign: 'middle',
                    fontSize: 'var(--text-base)',
                    lineHeight: 1.5,
                  }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
