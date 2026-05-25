import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const REGIONS = ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
  'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South Ethiopia',
  'South West Ethiopia', 'Tigray', 'Central Ethiopia'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm_password: '', preferred_language: 'en',
    tax_profile: {
      taxpayer_type: 'individual', address: '', city: '', region: 'Addis Ababa',
      business_name: '', business_sector: 'trade', national_id: '',
    }
  });

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('tp_')) {
      setForm(f => ({ ...f, tax_profile: { ...f.tax_profile, [name.slice(3)]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const payload = { ...form };
      if (payload.tax_profile.taxpayer_type === 'individual') {
        delete payload.tax_profile.business_name;
        delete payload.tax_profile.business_sector;
      }
      const res = await authAPI.register(payload);
      const { tokens, user } = res.data;
      setAuth(user, tokens.access, tokens.refresh);
      toast.success(`Registration successful! Your TIN: ${user.tin}`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setErrors(data || {});
      toast.error('Registration failed. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
        Create Account
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        Register for your Tax Identification Number (TIN)
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: s <= step ? '#1a5276' : '#e2e8f0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required error={errors.first_name?.[0]} />
              <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required error={errors.last_name?.[0]} />
            </div>
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required error={errors.email?.[0]} />
            <Input label="Phone (e.g. +251911234567)" name="phone" value={form.phone} onChange={handleChange} error={errors.phone?.[0]} />
            <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required hint="Min 8 characters" error={errors.password?.[0]} />
            <Input label="Confirm Password" type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required error={errors.confirm_password?.[0]} />
            <Button type="button" fullWidth onClick={() => setStep(2)}>Next: Tax Profile →</Button>
          </>
        )}

        {step === 2 && (
          <>
            <Select label="Taxpayer Type" name="tp_taxpayer_type" value={form.tax_profile.taxpayer_type} onChange={handleChange} required>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="ngo">NGO / Non-Profit</option>
            </Select>

            {form.tax_profile.taxpayer_type === 'business' && (
              <>
                <Input label="Business Name" name="tp_business_name" value={form.tax_profile.business_name} onChange={handleChange} />
                <Select label="Business Sector" name="tp_business_sector" value={form.tax_profile.business_sector} onChange={handleChange}>
                  <option value="trade">Trade</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="service">Service</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="other">Other</option>
                </Select>
              </>
            )}

            <Input label="Address" name="tp_address" value={form.tax_profile.address} onChange={handleChange} required error={errors.tax_profile?.address?.[0]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="City" name="tp_city" value={form.tax_profile.city} onChange={handleChange} required />
              <Select label="Region" name="tp_region" value={form.tax_profile.region} onChange={handleChange} required>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            <Input label="National ID" name="tp_national_id" value={form.tax_profile.national_id} onChange={handleChange} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
              <Button type="submit" loading={loading} style={{ flex: 2 }}>Register & Get TIN</Button>
            </div>
          </>
        )}
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#1a5276', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
}
