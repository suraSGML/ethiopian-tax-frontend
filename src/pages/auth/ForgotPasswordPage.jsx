import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      setSent(true);
      toast.success('Reset link sent if email exists.');
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check Your Email</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          If an account exists for <strong>{email}</strong>, a password reset link has been sent.
        </p>
        <Link to="/login" style={{ color: '#1a5276', fontWeight: 600, textDecoration: 'none' }}>← Back to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Reset Password</h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Enter your email to receive a reset link.
      </p>
      <form onSubmit={handleSubmit}>
        <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
        <Button type="submit" loading={loading} fullWidth>Send Reset Link</Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ color: '#1a5276', textDecoration: 'none' }}>← Back to Login</Link>
      </p>
    </div>
  );
}
