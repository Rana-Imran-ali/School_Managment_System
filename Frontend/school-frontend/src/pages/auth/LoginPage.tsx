/**
 * LoginPage – Dual Authentication view (Sign In & Sign Up / Register).
 * Supports self-registration for Students, Teachers, and Parents to set credentials.
 * Also includes 1-click Quick Access Demo Accounts for rapid evaluation.
 */
import React, { useState } from 'react';
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
  Shield,
  GraduationCap,
  Users,
  UserCheck,
  UserPlus,
  User as UserIcon,
  Phone,
  CheckCircle2,
} from 'lucide-react';

/** Pre-seeded demo accounts for quick testing */
const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Administrator',
    email: 'admin@educore.edu',
    icon: <Shield size={18} />,
    color: '#6366f1',
    desc: 'Full system control',
  },
  {
    role: 'teacher' as const,
    label: 'Teacher',
    email: 'sarah.jenkins@educore.edu',
    icon: <GraduationCap size={18} />,
    color: '#06b6d4',
    desc: 'Class & grade management',
  },
  {
    role: 'student' as const,
    label: 'Student',
    email: 'ethan.hunt@student.educore.edu',
    icon: <Users size={18} />,
    color: '#10b981',
    desc: 'View grades & timetable',
  },
  {
    role: 'parent' as const,
    label: 'Parent',
    email: 'robert.hunt@gmail.com',
    icon: <UserCheck size={18} />,
    color: '#f59e0b',
    desc: 'Monitor child progress',
  },
];

type AuthMode = 'login' | 'register';
type RegisterRole = 'student' | 'teacher' | 'parent';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, registerUser, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up state
  const [regRole, setRegRole] = useState<RegisterRole>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Destination after authentication
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

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

    const success = await loginWithEmail(email, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password. Please verify your credentials or register a new account.');
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Handle Sign Up / Registration                                     */
  /* ------------------------------------------------------------------ */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    const res = await registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      password_confirmation: regConfirmPassword,
      role: regRole,
      phone: regPhone.trim() || undefined,
      gender: regGender,
    });

    if (res.success) {
      setSuccessMsg(`Account created successfully! Welcome to EduCore.`);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } else {
      setError(res.error || 'Registration failed. Email may already be in use.');
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Handle Demo Quick Access                                          */
  /* ------------------------------------------------------------------ */
  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setSuccessMsg('');
    setEmail(demoEmail);
    setPassword('password123');

    const success = await loginWithEmail(demoEmail, 'password123');
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Demo login failed. Make sure the backend server is running.');
    }
  };

  return (
    <div className="login-page" id="login-page">
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
                <div className="login-feature-dot" style={{ background: '#f59e0b' }} />
                <span>Instant Self-Service Registration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            {/* Mode Switcher Tabs */}
            <div className="auth-tab-bar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-glass-strong)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: authMode === 'login' ? 'var(--primary-gradient)' : 'transparent',
                  color: authMode === 'login' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: authMode === 'register' ? 'var(--primary-gradient)' : 'transparent',
                  color: authMode === 'register' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                <UserPlus size={15} /> Create Account
              </button>
            </div>

            {/* Header Titles */}
            <div className="login-form-header">
              <h2>{authMode === 'login' ? 'Welcome Back' : 'Create New Account'}</h2>
              <p>
                {authMode === 'login'
                  ? 'Sign in to access your role-specific dashboard'
                  : 'Register as a Student, Teacher, or Parent to set your credentials'}
              </p>
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

            {/* ========================================================= */}
            {/*  SIGN IN FORM                                             */}
            {/* ========================================================= */}
            {authMode === 'login' ? (
              <>
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

                {/* Quick Access Demo Accounts */}
                <div className="login-demo-section">
                  <div className="login-demo-divider">
                    <span>Quick Access — Pre-seeded Accounts</span>
                  </div>

                  <div className="login-demo-grid">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.role}
                        className="login-demo-card"
                        id={`demo-login-${account.role}`}
                        onClick={() => handleDemoLogin(account.email)}
                        disabled={isAuthenticating}
                        style={{ '--demo-accent': account.color } as React.CSSProperties}
                      >
                        <div className="login-demo-icon">{account.icon}</div>
                        <div className="login-demo-info">
                          <span className="login-demo-role">{account.label}</span>
                          <span className="login-demo-desc">{account.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* ========================================================= */
              /*  SIGN UP / REGISTRATION FORM                              */
              /* ========================================================= */
              <form onSubmit={handleRegisterSubmit} className="login-form" id="register-form">
                {/* Role Picker Pills */}
                <div className="login-input-group">
                  <label>I am registering as a:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      style={{
                        padding: '0.6rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: regRole === 'student' ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                        background: regRole === 'student' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-glass-strong)',
                        color: regRole === 'student' ? '#10b981' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Users size={15} /> Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('teacher')}
                      style={{
                        padding: '0.6rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: regRole === 'teacher' ? '1.5px solid #06b6d4' : '1px solid var(--border-subtle)',
                        background: regRole === 'teacher' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-glass-strong)',
                        color: regRole === 'teacher' ? '#06b6d4' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <GraduationCap size={15} /> Teacher
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('parent')}
                      style={{
                        padding: '0.6rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: regRole === 'parent' ? '1.5px solid #f59e0b' : '1px solid var(--border-subtle)',
                        background: regRole === 'parent' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-glass-strong)',
                        color: regRole === 'parent' ? '#f59e0b' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <UserCheck size={15} /> Parent
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="login-input-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="login-input-wrapper">
                    <UserIcon size={18} className="login-input-icon" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="e.g. Johnathan Smith"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="login-input-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="login-input-wrapper">
                    <Mail size={18} className="login-input-icon" />
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="e.g. john.smith@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>

                {/* Phone & Gender row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div className="login-input-group">
                    <label htmlFor="reg-phone">Phone (Optional)</label>
                    <div className="login-input-wrapper">
                      <Phone size={18} className="login-input-icon" />
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        disabled={isAuthenticating}
                      />
                    </div>
                  </div>

                  <div className="login-input-group">
                    <label htmlFor="reg-gender">Gender</label>
                    <select
                      id="reg-gender"
                      className="form-select"
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      disabled={isAuthenticating}
                      style={{ height: '42px', marginTop: '1px' }}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="login-input-group">
                  <label htmlFor="reg-password">Password (Min 8 Characters)</label>
                  <div className="login-input-wrapper">
                    <Lock size={18} className="login-input-icon" />
                    <input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Create secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isAuthenticating}
                    />
                    <button
                      type="button"
                      className="login-eye-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="login-input-group">
                  <label htmlFor="reg-confirm-password">Confirm Password</label>
                  <div className="login-input-wrapper">
                    <Lock size={18} className="login-input-icon" />
                    <input
                      id="reg-confirm-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="login-submit-btn"
                  id="register-submit"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="login-btn-spinner" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Register & Access {regRole.toUpperCase()} Portal
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Toggle Note */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {authMode === 'login' ? (
                <>
                  Need new credentials?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Register as Student, Teacher, or Parent
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Sign In with existing credentials
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
