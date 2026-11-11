/**
 * Navbar – Top bar with user info, role badge, interactive real-time notification bell, and sign out.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  Shield,
  GraduationCap,
  Users,
  UserCheck,
  Sun,
  Moon,
} from 'lucide-react';
import type { AppNotification } from '../../types';
import { notificationService } from '../../api/notificationService';
import { NotificationDropdown } from '../NotificationDropdown';
import echo from '../../echo';

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  admin:   { icon: <Shield size={14} />,        color: '#6366f1', label: 'Administrator' },
  teacher: { icon: <GraduationCap size={14} />, color: '#06b6d4', label: 'Teacher' },
  student: { icon: <Users size={14} />,          color: '#10b981', label: 'Student' },
  parent:  { icon: <UserCheck size={14} />,      color: '#f59e0b', label: 'Parent / Guardian' },
};

export const Navbar: React.FC = () => {
  const { currentUser, currentRole, logout } = useAuth();
  const navigate = useNavigate();
  const roleInfo = ROLE_CONFIG[currentRole] || ROLE_CONFIG.student;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(30);
      if (data) {
        setNotifications(data.items || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch initial notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Real-time WebSocket listener for user notifications
  useEffect(() => {
    if (!currentUser?.id) return;

    fetchNotifications();

    const channelName = `users.${currentUser.id}`;
    const channel = echo.private(channelName);

    const handleNewNotification = (event: any) => {
      const incoming: AppNotification = {
        id: event.id || Date.now(),
        user_id: Number(event.user_id),
        type: event.type || 'general',
        title: event.title || 'New Notification',
        message: event.message || '',
        link: event.link,
        data: event.data,
        is_read: false,
        created_at: event.created_at || new Date().toISOString(),
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    channel.listen('.NotificationSent', handleNewNotification);
    channel.listen('NotificationSent', handleNewNotification);

    return () => {
      channel.stopListening('.NotificationSent', handleNewNotification);
      channel.stopListening('NotificationSent', handleNewNotification);
      echo.leave(channelName);
    };
  }, [currentUser?.id]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      if (typeof res?.unread_count === 'number') {
        setUnreadCount(res.unread_count);
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      const target = notifications.find((n) => n.id === id);
      const res = await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (typeof res?.unread_count === 'number') {
        setUnreadCount(res.unread_count);
      } else if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="top-navbar" id="top-navbar">
      <div className="navbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Academic Session:
          </span>
          <span
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            ● 2025-2026 (Active)
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Role badge (display only) */}
        <div
          className="navbar-role-badge"
          style={{
            background: `${roleInfo.color}18`,
            border: `1px solid ${roleInfo.color}40`,
            color: roleInfo.color,
          }}
        >
          {roleInfo.icon}
          <span>{roleInfo.label}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="navbar-icon-btn"
          id="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Interactive Notifications Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            id="btn-notifications"
            className="navbar-icon-btn"
            title="Notifications"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            style={{
              background: isDropdownOpen ? 'var(--bg-card-hover)' : undefined,
              color: isDropdownOpen ? 'var(--primary)' : undefined,
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDeleteNotification}
              onClose={() => setIsDropdownOpen(false)}
            />
          )}
        </div>

        {/* Profile */}
        <div className="navbar-profile">
          <img
            src={
              currentUser.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser.name
              )}&background=6366f1&color=fff&size=80`
            }
            alt={currentUser.name}
            className="avatar-img"
          />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser.name}</div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {currentUser.role}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          className="navbar-icon-btn navbar-logout-btn"
          id="navbar-btn-logout"
          onClick={handleLogout}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
