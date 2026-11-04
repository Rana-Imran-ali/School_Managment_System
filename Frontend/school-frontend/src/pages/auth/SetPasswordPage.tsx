import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { authService } from '../../api/authService';

export const SetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !emailParam) {
      setError('Invalid or incomplete password setup link. Please contact your school administrator.');
    }
  }, [token, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.setPassword({
        token,
        email: emailParam,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res?.token) {
        setSuccess(true);
        // Refresh session in context or redirect to root dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1800);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.password?.[0] ||
        'Failed to set password. The link might be expired or invalid.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page" id="set-password-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <div className="login-container" style={{ maxWidth: '480px' }}>
        <div className="login-form-panel" style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}>
          <div className="login-form-wrapper">
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--primary-gradient)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  marginBottom: '1rem',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                Set Your Account Password
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Welcome to EduCore! Choose a secure password for <br />
                <strong style={{ color: 'var(--primary)' }}>{emailParam || 'your student account'}</strong>
              </p>
            </div>

            {error && (
              <div className="login-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>Password Configured!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                  Logging you in automatically and redirecting to your student dashboard...
                </p>
                <div className="login-btn-spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-input-group">
                  <label htmlFor="set-password">New Password</label>
                  <div className="login-input-wrapper">
                    <Lock size={18} className="login-input-icon" />
                    <input
                      id="set-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting || !token}
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

                <div className="login-input-group">
                  <label htmlFor="set-confirm-password">Confirm Password</label>
                  <div className="login-input-wrapper">
                    <Lock size={18} className="login-input-icon" />
                    <input
                      id="set-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-type new password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting || !token}
                    />
                    <button
                      type="button"
                      className="login-eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting || !token || !emailParam}
                  style={{ marginTop: '0.5rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="login-btn-spinner" />
                      Saving Password…
                    </>
                  ) : (
                    <>
                      Set Password & Enter Portal
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem' }}>
                  <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    Already set your password? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage;
