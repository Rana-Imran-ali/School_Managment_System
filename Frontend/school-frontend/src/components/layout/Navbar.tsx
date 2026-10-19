/**
 * Navbar – Top bar with user info, role badge, and notification icon.
 * Removed the old "VIEW AS" role-switcher; users now log in/out properly.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  Shield,
  GraduationCap,
  Users,
  UserCheck,
} from 'lucide-react';

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
        {/* Role badge (display only, no switcher) */}
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

        {/* Notifications */}
        <button
          id="btn-notifications"
          className="navbar-icon-btn"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="navbar-notification-dot" />
        </button>

        {/* Profile */}
        <div className="navbar-profile">
          <img
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=80`}
            alt={currentUser.name}
            className="avatar-img"
          />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
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
