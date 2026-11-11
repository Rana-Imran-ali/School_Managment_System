/**
 * LoginPage – Official Single Sign-On Authentication view.
 * Public self-registration is disabled. Students, Teachers, and Parents
 * are enrolled exclusively by school administration via email invitations.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Info,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Destination after authentication
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

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

  /* ------------------------------------------------------------------ */
  /*  Handle Sign In                                                    */
  /* ------------------------------------------------------------------ */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const result = await loginWithEmail(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid email or password. Please verify your credentials or check your invitation email.');
    }
  };

  return (
    <div className="login-page" id="login-page">
      {/* Top right Theme Toggle */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', zIndex: 10 }}>
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            padding: '0.55rem',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Floating ambient orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-container">
        {/* Left Branding Panel */}
        <div className="login-branding">
          <div className="login-brand-content">
            <div className="login-brand-icon">
              <Sparkles size={36} />
            </div>
            <h1 className="login-brand-title">EduCore</h1>
            <p className="login-brand-subtitle">Academy Cloud Platform</p>
            <p className="login-brand-desc">
              Streamline your school management with a unified platform for
              students, teachers, parents, and administrative staff.
            </p>

            <div className="login-features">
              <div className="login-feature-item">
                <div className="login-feature-dot" style={{ background: '#6366f1' }} />
                <span>Single Sign-On for Student, Teacher & Parent</span>
              </div>
              <div className="login-feature-item">
                <div className="login-feature-dot" style={{ background: '#06b6d4' }} />
                <span>Automated Role-Based Portal Access</span>
              </div>
              <div className="login-feature-item">
                <div className="login-feature-dot" style={{ background: '#10b981' }} />
                <span>Live Marks, Fee Vouchers & Attendance</span>
              </div>
              <div className="login-feature-item">
                <div className="login-feature-dot" style={{ background: '#a855f7' }} />
                <span>Admin-Invited Secure Account Activation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            {/* Header Titles */}
            <div className="login-form-header" style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                <ShieldCheck size={14} /> Authorized Personnel Only
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to access your role-specific dashboard</p>
            </div>

            {/* Error & Success Feedback */}
            {error && (
              <div className="login-error" id="login-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '1.2rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleLoginSubmit} className="login-form" id="login-form">
              <div className="login-input-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="login-input-wrapper">
                  <Mail size={18} className="login-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="e.g. yourname@educore.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isAuthenticating}
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrapper">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isAuthenticating}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                id="login-submit"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <div className="login-btn-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Notice regarding Invitation-Only Access */}
            <div
              style={{
                marginTop: '2rem',
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-glass-strong)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                  Need an Account?
                </strong>
                Student, Teacher, and Parent accounts are enrolled exclusively by the school administration. When enrolled, an activation link is sent to your email to configure your password.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
