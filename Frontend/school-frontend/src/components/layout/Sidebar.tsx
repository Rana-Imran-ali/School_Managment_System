/**
 * Sidebar – Main navigation component.
 * Shows only routes the current user's role is allowed to access.
 * Includes a logout button.
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRouteAccess } from '../../config/roles';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  Award,
  CreditCard,
  Megaphone,
  MessageSquare,
  Activity,
  Sparkles,
  LogOut,
} from 'lucide-react';

/** Navigation item definition */
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',              label: 'Dashboard',      icon: <LayoutDashboard size={18} />, section: 'Core Management' },
  { path: '/students',      label: 'Students',       icon: <Users size={18} /> },
  { path: '/teachers',      label: 'Teachers',       icon: <GraduationCap size={18} /> },
  { path: '/academics',     label: 'Academic Setup',  icon: <BookOpen size={18} />, section: 'Academics & Schedule' },
  { path: '/timetable',     label: 'Timetable',      icon: <Calendar size={18} /> },
  { path: '/attendance',    label: 'Attendance',      icon: <UserCheck size={18} /> },
  { path: '/examinations',  label: 'Exams & Marks',  icon: <Award size={18} /> },
  { path: '/fees',          label: 'Fee Management',  icon: <CreditCard size={18} />, section: 'Finance & Administration' },
  { path: '/announcements', label: 'Notice Board',   icon: <Megaphone size={18} />, section: 'Communication & Logs' },
  { path: '/messages',      label: 'Messages',       icon: <MessageSquare size={18} /> },
  { path: '/activity-logs', label: 'Audit Trail',    icon: <Activity size={18} /> },
];

export const Sidebar: React.FC = () => {
  const { currentUser, currentRole, logout } = useAuth();
  const navigate = useNavigate();

  // Filter nav items to only those the current role can access
  const allowedItems = NAV_ITEMS.filter((item) => hasRouteAccess(currentRole, item.path));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Group items by section for visual separation
  let lastSection = '';

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="brand-name">EduCore</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', letterSpacing: '0.04em' }}>
            ACADEMY CLOUD
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {allowedItems.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <React.Fragment key={item.path}>
              {showSection && <div className="nav-section-title">{item.section}</div>}
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id={`nav-${item.path.replace('/', '') || 'dashboard'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <img
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=80`}
            alt=""
            className="avatar-img"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-meta-name">{currentUser.name}</div>
            <div className="user-meta-role">{currentRole} portal</div>
          </div>
        </div>
        <button
          className="sidebar-logout-btn"
          id="btn-logout"
          onClick={handleLogout}
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
