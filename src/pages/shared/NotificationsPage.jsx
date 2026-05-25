import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonLine } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  filing_deadline:      { icon: '⏰', color: '#d97706', bg: '#fef3c7' },
  payment_confirmation: { icon: '✅', color: '#1e8449', bg: '#d1fae5' },
  filing_approved:      { icon: '✅', color: '#1e8449', bg: '#d1fae5' },
  filing_rejected:      { icon: '❌', color: '#c0392b', bg: '#fee2e2' },
  penalty_notice:       { icon: '⚠️', color: '#c0392b', bg: '#fee2e2' },
  general:              { icon: '📢', color: '#1a5276', bg: '#dbeafe' },
  system:               { icon: '⚙️', color: '#64748b', bg: '#f1f5f9' },
  fraud_alert:          { icon: '🚨', color: '#c0392b', bg: '#fee2e2' },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => dashboardAPI.notifications().then(r => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => dashboardAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications', 'unread-count']),
  });

  const markAllMutation = useMutation({
    mutationFn: () => dashboardAPI.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read.');
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    },
  });

  const notifications = data?.results || [];
  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) :
                   filter === 'read'   ? notifications.filter(n => n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: 'Notifications' }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Notifications</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {unreadCount > 0 ? (
              <span><span style={{ color: '#1a5276', fontWeight: 700 }}>{unreadCount}</span> unread</span>
            ) : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
            ✓ Mark All Read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'all',    label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read',   label: 'Read' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filter === tab.key ? '#1a5276' : '#f1f5f9',
              color: filter === tab.key ? '#fff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => (
            <Card key={i} animate={false}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <SkeletonLine width="60%" height="14px" style={{ marginBottom: '8px' }} />
                  <SkeletonLine width="90%" height="10px" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
          <p style={{ color: '#64748b', fontWeight: 500 }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map((n, i) => {
            const config = TYPE_CONFIG[n.notification_type] || TYPE_CONFIG.general;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                style={{
                  background: n.is_read ? '#fff' : '#f0f9ff',
                  border: `1px solid ${n.is_read ? '#e2e8f0' : '#bae6fd'}`,
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  animation: `fadeIn 0.2s ease ${i * 0.03}s both`,
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.background = '#e0f2fe'; }}
                onMouseLeave={e => { if (!n.is_read) e.currentTarget.style.background = '#f0f9ff'; }}
              >
                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: config.bg,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {config.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <p style={{
                      fontWeight: n.is_read ? 500 : 700,
                      color: '#1e293b',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem',
                    }}>
                      {n.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {!n.is_read && (
                        <span style={{ width: '8px', height: '8px', background: '#1a5276', borderRadius: '50%', display: 'inline-block' }} />
                      )}
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      color: config.color, background: config.bg,
                      padding: '2px 8px', borderRadius: '10px',
                    }}>
                      {n.notification_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {format(new Date(n.created_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
