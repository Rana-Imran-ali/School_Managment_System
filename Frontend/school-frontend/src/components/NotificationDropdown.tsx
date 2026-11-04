import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Mail,
  Megaphone,
  CheckCheck,
  Trash2,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Info,
  ExternalLink,
} from 'lucide-react';
import type { AppNotification } from '../types';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <Mail size={16} color="#6366f1" />;
    case 'announcement':
      return <Megaphone size={16} color="#f59e0b" />;
    case 'attendance':
      return <CalendarCheck size={16} color="#06b6d4" />;
    case 'exam':
      return <GraduationCap size={16} color="#8b5cf6" />;
    case 'fee':
      return <CreditCard size={16} color="#10b981" />;
    default:
      return <Info size={16} color="#64748b" />;
  }
};

const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <div
      className="notification-dropdown-menu"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '380px',
        maxHeight: '490px',
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-subtle, rgba(226, 232, 240, 0.8))',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(0,0,0,0.05)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        animation: 'fadeInSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.9rem 1.15rem',
          borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong, rgba(248, 250, 252, 0.8))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main, #0f172a)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'var(--primary, #6366f1)',
                color: '#ffffff',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary, #6366f1)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '6px',
            }}
            title="Mark all as read"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '360px',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '0.85rem' }}>Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'var(--bg-card-hover, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted, #94a3b8)',
              }}
            >
              <Bell size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>
                No notifications yet
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748b)', marginTop: '0.2rem' }}>
                You're all caught up with alerts and activities.
              </div>
            </div>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.85rem 1.15rem',
                borderBottom: '1px solid var(--border-subtle, #f8fafc)',
                cursor: 'pointer',
                background: item.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                transition: 'background 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.is_read
                  ? 'var(--bg-card-hover, #f8fafc)'
                  : 'rgba(99, 102, 241, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = item.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.04)';
              }}
            >
              {/* Type Icon */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'var(--bg-card-hover, #f1f5f9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.15rem',
                }}
              >
                {getNotificationIcon(item.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.83rem',
                      fontWeight: item.is_read ? 600 : 750,
                      color: item.is_read ? 'var(--text-main, #334155)' : 'var(--text-main, #0f172a)',
                    }}
                  >
                    {item.title}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint, #94a3b8)', whiteSpace: 'nowrap' }}>
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.77rem',
                    color: 'var(--text-muted, #64748b)',
                    margin: '0.2rem 0 0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.message}
                </p>

                {item.link && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      color: 'var(--primary, #6366f1)',
                      fontWeight: 600,
                      marginTop: '0.35rem',
                    }}
                  >
                    <span>View details</span>
                    <ExternalLink size={10} />
                  </div>
                )}
              </div>

              {/* Delete / Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                {!item.is_read && (
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--primary, #6366f1)',
                      display: 'block',
                      marginTop: '0.3rem',
                    }}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-faint, #cbd5e1)',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    marginTop: 'auto',
                    borderRadius: '4px',
                  }}
                  title="Remove notification"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.65rem 1.15rem',
          borderTop: '1px solid var(--border-subtle, #f1f5f9)',
          background: 'var(--bg-glass-strong, rgba(248, 250, 252, 0.8))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted, #64748b)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
            }}
          />
          Live WebSocket Alerts
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint, #94a3b8)' }}>
          Real-time School Sync
        </span>
      </div>
    </div>
  );
};
export default NotificationDropdown;

