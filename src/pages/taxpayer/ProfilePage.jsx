import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../../api/auth';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonCard } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const REGIONS = [
  'Addis Ababa','Afar','Amhara','Benishangul-Gumuz','Dire Dawa',
  'Gambela','Harari','Oromia','Sidama','Somali','South Ethiopia',
  'South West Ethiopia','Tigray','Central Ethiopia',
];

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [editTaxProfile, setEditTaxProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
  const [showPw, setShowPw] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getProfile().then(r => r.data),
  });

  const { data: taxProfile, isLoading: taxLoading } = useQuery({
    queryKey: ['tax-profile'],
    queryFn: () => authAPI.getTaxProfile().then(r => r.data),
  });

  const [form, setForm] = useState({});
  const [taxForm, setTaxForm] = useState({});

  useEffect(() => {
    if (user) setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      preferred_language: user.preferred_language || 'en',
    });
  }, [user]);

  useEffect(() => {
    if (taxProfile) setTaxForm({
      taxpayer_type: taxProfile.taxpayer_type || 'individual',
      business_name: taxProfile.business_name || '',
      business_sector: taxProfile.business_sector || 'trade',
      address: taxProfile.address || '',
      city: taxProfile.city || '',
      region: taxProfile.region || 'Addis Ababa',
      national_id: taxProfile.national_id || '',
      is_vat_registered: taxProfile.is_vat_registered || false,
    });
  }, [taxProfile]);

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      toast.success('Profile updated successfully.');
      setEditMode(false);
      updateUser(res.data);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Update failed.'),
  });

  const updateTaxMutation = useMutation({
    mutationFn: (data) => authAPI.updateTaxProfile(data),
    onSuccess: () => {
      toast.success('Tax profile updated.');
      setEditTaxProfile(false);
      queryClient.invalidateQueries(['tax-profile']);
    },
    onError: () => toast.error('Tax profile update failed.'),
  });

  const pwMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully.');
      setPwForm({ old_password: '', new_password: '', confirm_new_password: '' });
      setShowPw(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || err.response?.data?.old_password?.[0] || 'Password change failed.'),
  });

  const handlePwSubmit = () => {
    if (pwForm.new_password !== pwForm.confirm_new_password) {
      toast.error('New passwords do not match.');
      return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    pwMutation.mutate(pwForm);
  };

  if (isLoading) return (
    <div>
      <SkeletonCard />
      <div style={{ marginTop: '1rem' }}><SkeletonCard /></div>
    </div>
  );

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }} className="animate-fade-in">
      <Breadcrumb items={[{ label: 'Profile' }]} />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>My Profile</h1>

      {/* TIN Card */}
      <Card style={{
        background: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)',
        color: '#fff', marginBottom: '1rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '30%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tax Identification Number
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              {user?.tin || '—'}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {user?.is_verified
                ? <><span style={{ color: '#2ecc71' }}>✓</span> Verified Account</>
                : <><span style={{ color: '#f39c12' }}>⚠</span> Pending Verification</>
              }
            </div>
          </div>
          <div style={{ fontSize: '3.5rem', opacity: 0.2 }}>🇪🇹</div>
        </div>
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>Full Name</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>Role</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.role?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>Member Since</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.date_joined ? new Date(user.date_joined).getFullYear() : '—'}</div>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>👤 Personal Information</h3>
          <Button variant={editMode ? 'secondary' : 'outline'} size="sm" onClick={() => setEditMode(!editMode)}>
            {editMode ? '✕ Cancel' : '✏ Edit'}
          </Button>
        </div>

        {editMode ? (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              <Input label="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
            </div>
            <Input label="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+251911234567" />
            <Select label="Preferred Language" value={form.preferred_language} onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
              <option value="en">🇬🇧 English</option>
              <option value="am">🇪🇹 Amharic (አማርኛ)</option>
            </Select>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={() => updateMutation.mutate(form)} loading={updateMutation.isPending}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div>
            {[
              { label: 'Full Name',  value: `${user?.first_name} ${user?.last_name}` },
              { label: 'Email',      value: user?.email },
              { label: 'Phone',      value: user?.phone || '—' },
              { label: 'Language',   value: user?.preferred_language === 'am' ? '🇪🇹 Amharic' : '🇬🇧 English' },
              { label: 'Joined',     value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Last Login', value: user?.last_login ? new Date(user.last_login).toLocaleString() : '—' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>{item.label}</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tax Profile */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>🏢 Tax Profile</h3>
          <Button variant={editTaxProfile ? 'secondary' : 'outline'} size="sm" onClick={() => setEditTaxProfile(!editTaxProfile)}>
            {editTaxProfile ? '✕ Cancel' : '✏ Edit'}
          </Button>
        </div>

        {taxLoading ? (
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading tax profile...</div>
        ) : editTaxProfile ? (
          <div className="animate-fade-in">
            <Select label="Taxpayer Type" value={taxForm.taxpayer_type} onChange={e => setTaxForm(f => ({ ...f, taxpayer_type: e.target.value }))}>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="ngo">NGO / Non-Profit</option>
            </Select>
            {taxForm.taxpayer_type === 'business' && (
              <>
                <Input label="Business Name" value={taxForm.business_name} onChange={e => setTaxForm(f => ({ ...f, business_name: e.target.value }))} />
                <Select label="Business Sector" value={taxForm.business_sector} onChange={e => setTaxForm(f => ({ ...f, business_sector: e.target.value }))}>
                  <option value="trade">Trade</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="service">Service</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="other">Other</option>
                </Select>
              </>
            )}
            <Input label="Address" value={taxForm.address} onChange={e => setTaxForm(f => ({ ...f, address: e.target.value }))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="City" value={taxForm.city} onChange={e => setTaxForm(f => ({ ...f, city: e.target.value }))} required />
              <Select label="Region" value={taxForm.region} onChange={e => setTaxForm(f => ({ ...f, region: e.target.value }))}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            <Input label="National ID" value={taxForm.national_id} onChange={e => setTaxForm(f => ({ ...f, national_id: e.target.value }))} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setEditTaxProfile(false)}>Cancel</Button>
              <Button onClick={() => updateTaxMutation.mutate(taxForm)} loading={updateTaxMutation.isPending}>Save Tax Profile</Button>
            </div>
          </div>
        ) : (
          <div>
            {[
              { label: 'Taxpayer Type',  value: taxProfile?.taxpayer_type?.replace(/\b\w/g,c=>c.toUpperCase()) || '—' },
              { label: 'Business Name',  value: taxProfile?.business_name || '—' },
              { label: 'Business Sector',value: taxProfile?.business_sector?.replace(/\b\w/g,c=>c.toUpperCase()) || '—' },
              { label: 'Address',        value: taxProfile?.address || '—' },
              { label: 'City',           value: taxProfile?.city || '—' },
              { label: 'Region',         value: taxProfile?.region || '—' },
              { label: 'National ID',    value: taxProfile?.national_id || '—' },
              { label: 'VAT Registered', value: taxProfile?.is_vat_registered ? '✓ Yes' : '✗ No' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>{item.label}</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPw ? '1rem' : 0 }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>🔐 Security</h3>
          <Button variant={showPw ? 'secondary' : 'outline'} size="sm" onClick={() => setShowPw(!showPw)}>
            {showPw ? '✕ Cancel' : 'Change Password'}
          </Button>
        </div>

        {showPw && (
          <div className="animate-fade-in">
            <Input label="Current Password" type="password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} required />
            <Input label="New Password" type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} required hint="Minimum 8 characters" />
            <Input label="Confirm New Password" type="password" value={pwForm.confirm_new_password} onChange={e => setPwForm(f => ({ ...f, confirm_new_password: e.target.value }))} required />

            {/* Password strength */}
            {pwForm.new_password && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Password Strength</div>
                {(() => {
                  const p = pwForm.new_password;
                  const score = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
                  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
                  const colors = ['', '#c0392b', '#d97706', '#2e86c1', '#1e8449'];
                  return (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= score ? colors[score] : '#e2e8f0', transition: 'background 0.3s' }} />
                      ))}
                      <span style={{ fontSize: '0.72rem', color: colors[score], fontWeight: 600, marginLeft: '6px', minWidth: '40px' }}>{labels[score]}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <Button onClick={handlePwSubmit} loading={pwMutation.isPending} fullWidth>Update Password</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
