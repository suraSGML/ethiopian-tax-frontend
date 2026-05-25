import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { authAPI } from '../../api/auth';
import { ConfirmDialog } from '../ui/Modal';
import toast from 'react-hot-toast';

const taxpayerNav = [
  { path: '/dashboard',    label: 'Dashboard',      icon: '📊', desc: 'Overview & stats' },
  { path: '/filings',      label: 'Tax Filings',     icon: '📋', desc: 'Manage filings' },
  { path: '/payments',     label: 'Payments',        icon: '💳', desc: 'Payment history' },
  { path: '/compliance',   label: 'Compliance',      icon: '🏆', desc: 'Score & certificate' },
  { path: '/calculator',   label: 'Tax Calculator',  icon: '🧮', desc: 'Estimate taxes' },
  { path: '/notifications',label: 'Notifications',   icon: '🔔', desc: 'Alerts & updates', badge: true },
  { path: '/profile',      label: 'Profile',         icon: '👤', desc: 'Account settings' },
];

const officerNav = [
  { path: '/officer',               label: 'Review Queue',  icon: '📋', desc: 'Pending filings' },
  { path: '/officer/filings',       label: 'All Filings',   icon: '📊', desc: 'Review all filings' },
  { path: '/officer/notifications', label: 'Notifications', icon: '🔔', desc: 'Alerts & updates', badge: true },
];

const adminNav = [
  { path: '/admin',               label: 'Dashboard',     icon: '📊', desc: 'System overview' },
  { path: '/admin/users',         label: 'Taxpayers',     icon: '👥', desc: 'Manage users' },
  { path: '/admin/filings',       label: 'All Filings',   icon: '📋', desc: 'Review filings' },
  { path: '/admin/reports',       label: 'Reports',       icon: '📈', desc: 'Revenue analytics' },
  { path: '/admin/fraud',         label: 'Fraud Alerts',  icon: '🚨', desc: 'Security alerts', badge: true },
  { path: '/admin/audit',         label: 'Audit Logs',    icon: '🔍', desc: 'Activity trail' },
  { path: '/admin/notifications', label: 'Notifications', icon: '🔔', desc: 'System alerts', badge: true },
];

export default function MainLayout({ isAdmin, isOfficer }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef();
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const navItems = isAdmin ? adminNav : isOfficer ? officerNav : taxpayerNav;

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1100);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => dashboardAPI.unreadCount().then(r => r.data),
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.unread_count || 0;

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authAPI.logout(refreshToken); } catch {}
    logout();
    queryClient.clear();
    navigate('/login');
    toast.success('Logged out successfully.');
    setLoggingOut(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('filing') || q.includes('tax')) navigate(isAdmin ? '/admin/filings' : isOfficer ? '/officer/filings' : '/filings');
    else if (q.includes('pay') || q.includes('receipt')) navigate(isAdmin ? '/admin' : '/payments');
    else if (q.includes('user') || q.includes('taxpayer')) navigate(isAdmin ? '/admin/users' : '/profile');
    else if (q.includes('report') || q.includes('revenue')) navigate(isAdmin ? '/admin/reports' : '/dashboard');
    else if (q.includes('fraud') || q.includes('alert')) navigate(isAdmin ? '/admin/fraud' : '/notifications');
    else if (q.includes('audit') || q.includes('log')) navigate(isAdmin ? '/admin/audit' : '/notifications');
    else if (q.includes('calc')) navigate('/calculator');
    else if (q.includes('notif')) navigate(isAdmin ? '/admin/notifications' : isOfficer ? '/officer/notifications' : '/notifications');
    setSearchQuery('');
  };

  const sidebarW = sidebarOpen ? '268px' : '72px';

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard' || item.path === '/admin' || item.path === '/officer'}
      data-tooltip={!sidebarOpen ? item.label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: sidebarOpen ? '0.75rem 1.1rem' : '0.75rem',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.62)',
        background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
        textDecoration: 'none',
        borderLeft: isActive ? '3px solid #f39c12' : '3px solid transparent',
        fontSize: 'var(--text-base)',
        fontWeight: isActive ? 600 : 400,
        transition: 'var(--transition)',
        margin: '1px 0',
        borderRadius: sidebarOpen ? '0 10px 10px 0' : '0',
        position: 'relative',
      })}
    >
      {({ isActive }) => (
        <>
          <span style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>{item.label}</div>
              {isActive && (
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6, marginTop: '1px' }}>{item.desc}</div>
              )}
            </div>
          )}
          {sidebarOpen && item.badge && unreadCount > 0 && (
            <span className="badge-pulse" style={{
              background: '#e74c3c', color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '1px 7px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              minWidth: '20px',
              textAlign: 'center',
              lineHeight: '18px',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {!sidebarOpen && item.badge && unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '7px', right: '7px',
              width: '9px', height: '9px',
              background: '#e74c3c', borderRadius: '50%',
              border: '1.5px solid #1a5276',
            }} />
          )}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: '0.85rem',
        minHeight: '72px',
      }}>
        <div style={{
          width: '40px', height: '40px', flexShrink: 0,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          🇪🇹
        </div>
        {sidebarOpen && (
          <div style={{ animation: 'fadeIn 0.2s ease', overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              Ministry of Revenue
            </div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.55, whiteSpace: 'nowrap', marginTop: '2px' }}>
              Digital Tax System
            </div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div style={{ padding: '0.85rem 1rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: isAdmin ? 'rgba(243,156,18,0.18)' : 'rgba(255,255,255,0.1)',
            color: isAdmin ? '#f39c12' : 'rgba(255,255,255,0.65)',
            fontSize: 'var(--text-xs)', fontWeight: 700,
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {user?.role === 'super_admin' ? '⭐ Super Admin' :
             user?.role === 'tax_officer' ? '🛡 Tax Officer' : '👤 Taxpayer'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => <NavItem key={item.path} item={item} />)}
      </nav>

      {/* User section */}
      <div style={{ padding: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {sidebarOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '0.85rem',
            marginBottom: '0.6rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '38px', height: '38px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 'var(--text-base)', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.25)',
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </div>
              {user?.tin && (
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.5, fontFamily: 'monospace', marginTop: '1px' }}>
                  {user.tin}
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          data-tooltip={!sidebarOpen ? 'Logout' : undefined}
          style={{
            width: '100%',
            padding: sidebarOpen ? '0.6rem 0.85rem' : '0.65rem',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.75)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: '0.6rem',
            transition: 'var(--transition)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.25)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(231,76,60,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >
          <span style={{ fontSize: '1.1rem' }}>🚪</span>
          {sidebarOpen && 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-100)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 99,
          animation: 'fadeIn 0.2s ease',
        }} />
      )}

      {/* Desktop Sidebar */}
      <aside className="hide-mobile" style={{
        width: sidebarW,
        background: 'linear-gradient(180deg, #1a5276 0%, #0d3349 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflowX: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className="hide-desktop" style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1a5276 0%, #0d3349 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 200,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflowX: 'hidden',
        boxShadow: mobileOpen ? '8px 0 32px rgba(0,0,0,0.3)' : 'none',
      }}>
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="hide-mobile" style={{
        flex: 1,
        marginLeft: sidebarW,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}>
        {/* Top bar */}
        <header style={{
          background: '#fff',
          padding: '0 1.75rem',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--gray-100)',
        }}>
          {/* Left: toggle + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.5rem', borderRadius: '8px',
                color: 'var(--gray-500)', fontSize: '1.2rem',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-800)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--gray-500)'; }}
            >
              ☰
            </button>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '420px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.9rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)', fontSize: '1rem', pointerEvents: 'none',
                }}>
                  🔍
                </span>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search filings, payments, users... (Ctrl+K)"
                  style={{
                    width: '100%',
                    padding: '0.55rem 2.5rem 0.55rem 2.5rem',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--gray-700)',
                    background: 'var(--gray-50)',
                    outline: 'none',
                    transition: 'var(--transition)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary-light)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(46,134,193,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--gray-400)', fontSize: '0.9rem',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {/* Notification bell */}
            <button
              onClick={() => navigate(isAdmin ? '/admin/notifications' : isOfficer ? '/officer/notifications' : '/notifications')}
              aria-label="Notifications"
              style={{
                position: 'relative', background: 'none', border: 'none',
                cursor: 'pointer', padding: '0.5rem', borderRadius: '10px',
                fontSize: '1.2rem', transition: 'var(--transition)',
                color: 'var(--gray-600)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              🔔
              {unreadCount > 0 && (
                <span className="badge-pulse" style={{
                  position: 'absolute', top: '3px', right: '3px',
                  background: '#e74c3c', color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '0 5px',
                  fontSize: '0.65rem', fontWeight: 700,
                  minWidth: '17px', textAlign: 'center',
                  lineHeight: '17px', height: '17px',
                  border: '1.5px solid #fff',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.4rem 0.85rem 0.4rem 0.5rem',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--gray-200)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.borderColor = 'var(--primary-100)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
              onClick={() => navigate(isAdmin ? '/admin' : isOfficer ? '/officer' : '/profile')}
            >
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 800,
                flexShrink: 0,
              }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.2 }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', lineHeight: 1 }}>
                  {user?.role?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.75rem' }} className="page-enter">
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{
          padding: '0.85rem 1.75rem',
          borderTop: '1px solid var(--gray-200)',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)' }}>
            © {new Date().getFullYear()} Ethiopian Ministry of Revenue
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)' }}>
            Digital Tax System v1.0 • Supabase PostgreSQL
          </span>
        </footer>
      </div>

      {/* Mobile main */}
      <div className="hide-desktop" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
          padding: '0 1rem',
          height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', padding: '0.4rem' }}>
            ☰
          </button>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 'var(--text-base)' }}>🇪🇹 Tax System</span>
          <button onClick={() => navigate(isAdmin ? '/admin/notifications' : isOfficer ? '/officer/notifications' : '/notifications')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', position: 'relative', padding: '0.4rem' }}>
            🔔
            {unreadCount > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '9px', height: '9px', background: '#e74c3c', borderRadius: '50%' }} />}
          </button>
        </header>
        <main style={{ flex: 1, padding: '1.25rem' }} className="page-enter">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of the Ethiopian Tax System?"
        confirmLabel="Sign Out"
        confirmVariant="danger"
        loading={loggingOut}
      />
    </div>
  );
}
