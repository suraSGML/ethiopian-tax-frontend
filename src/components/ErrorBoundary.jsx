import React from 'react';
import Button from './ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#f0f4f8', padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Button variant="outline" onClick={() => window.location.reload()}>
                🔄 Refresh Page
              </Button>
              <Button onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}>
                🏠 Go Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' }}>Error details</summary>
                <pre style={{ fontSize: '0.72rem', color: '#c0392b', background: '#fee2e2', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', overflow: 'auto' }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
