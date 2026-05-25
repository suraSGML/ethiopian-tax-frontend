import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.confirmPasswordReset({ token, ...form });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#c0392b' }}>Invalid reset link.</p>
      <Link to="/forgot-password" style={{ color: '#1a5276' }}>Request a new one</Link>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Set New Password</h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter your new password below.</p>
      <form onSubmit={handleSubmit}>
        <Input label="New Password" type="password" value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} required hint="Min 8 characters" />
        <Input label="Confirm Password" type="password" value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} required />
        <Button type="submit" loading={loading} fullWidth>Reset Password</Button>
      </form>
    </div>
  );
}
