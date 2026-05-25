import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(e2 => ({ ...e2, [e.target.name]: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await authAPI.login(form);
      const { access, refresh, user } = res.data;
      setAuth(user, access, refresh);
      toast.success(`Welcome back, ${user.first_name}! 👋`);
      navigate(['tax_officer','super_admin'].includes(user.role) ? '/admin' : '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) toast.error(data.detail);
      else if (data?.non_field_errors) toast.error(data.non_field_errors[0]);
      else toast.error('Invalid email or password.');
      setErrors(data || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--gray-800)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
        Sign In
      </h2>
      <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-base)', marginBottom: '2rem', lineHeight: 1.5 }}>
        Access your tax account securely
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          error={errors.email?.[0] || errors.email}
          prefix="✉"
          autoComplete="email"
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            error={errors.password?.[0] || errors.password}
            prefix="🔒"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '0.9rem', top: '2.45rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--gray-400)', fontSize: 'var(--text-base)',
              padding: '0.2rem',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-600)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-400)'}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        <div style={{ textAlign: 'right', marginTop: '-0.4rem', marginBottom: '1.5rem' }}>
          <Link to="/forgot-password" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          Sign In →
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 'var(--text-base)', color: 'var(--gray-500)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          Register here
        </Link>
      </p>
    </div>
  );
}
