import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminForgotPassword, adminLogin } from '../../lib/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // login | forgot | sent
  const [view, setView] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordKeyEvent = (e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // Arrived here right after successfully resetting a password.
  const justReset = Boolean(location.state?.resetSuccess);

  const goToForgot = () => {
    setError('');
    setForgotEmail(email); // carry over whatever they already typed, if anything
    setView('forgot');
  };

  const goToLogin = () => {
    setError('');
    setView('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Could not log in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminForgotPassword(forgotEmail);
      setView('sent');
    } catch (err) {
      setError(err.message || 'Could not send the reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      {view === 'login' && (
        <form className="admin-login__card" onSubmit={handleSubmit}>
          <p className="admin-login__eyebrow">Admin</p>
          <h1 className="admin-login__heading">Career portal login</h1>

          {justReset && (
            <p className="admin-login__success">Your password has been reset — log in with your new password.</p>
          )}

          <div className="admin-login__field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="admin-login__field">
            <div className="admin-login__field-header">
              <label htmlFor="admin-password">Password</label>
              <button type="button" className="admin-login__link" onClick={goToForgot}>
                Forgot password?
              </button>
            </div>
            <div className="admin-login__password-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handlePasswordKeyEvent}
                onKeyDown={handlePasswordKeyEvent}
              />
              <button
                type="button"
                className="admin-login__eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 002.83 2.83" />
                    <path d="M9.88 4.24A9.94 9.94 0 0112 4c5.5 0 9 5 9.6 8-.24 1.16-.77 2.32-1.55 3.4M6.53 6.53C4.6 7.86 3.1 9.7 2.4 12c1 3.5 4.5 8 9.6 8 1.35 0 2.6-.31 3.72-.85" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.4 12C3 8.5 6.5 4 12 4s9 4.5 9.6 8c-.6 3.5-4.1 8-9.6 8s-9-4.5-9.6-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {capsLockOn && <p className="admin-login__warning">Caps Lock is on</p>}
          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="admin-login__submit" disabled={loading}>
            {loading ? 'Logging in\u2026' : 'Log in'}
          </button>
        </form>
      )}

      {view === 'forgot' && (
        <form className="admin-login__card" onSubmit={handleForgotSubmit}>
          <p className="admin-login__eyebrow">Admin</p>
          <h1 className="admin-login__heading">Reset your password</h1>
          <p className="admin-login__subtext">
            Enter the email linked to your admin account and we&rsquo;ll send you a link to reset your
            password.
          </p>

          <div className="admin-login__field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              required
              autoFocus
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="admin-login__submit" disabled={loading}>
            {loading ? 'Sending\u2026' : 'Send reset link'}
          </button>

          <button type="button" className="admin-login__back" onClick={goToLogin}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Back to login
          </button>
        </form>
      )}

      {view === 'sent' && (
        <div className="admin-login__card admin-login__card--done">
          <p className="admin-login__eyebrow">Admin</p>
          <h1 className="admin-login__heading">Check your email</h1>
          <p className="admin-login__subtext">
            If an account exists for <strong>{forgotEmail}</strong>, we&rsquo;ve sent instructions to
            reset your password. The link is valid for a limited time.
          </p>

          <button type="button" className="admin-login__submit admin-login__submit--secondary" onClick={goToLogin}>
            Back to login
          </button>
        </div>
      )}

      <style>{`
        .admin-login {
          min-height: calc(100vh - 78px - 260px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 20px;
        }

        .admin-login__card {
          width: 100%;
          max-width: 360px;
          padding: 32px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          box-shadow: 0 20px 48px -28px rgba(11, 30, 61, 0.35);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-login__card--done {
          text-align: left;
        }

        .admin-login__eyebrow {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-gold);
        }

        .admin-login__heading {
          margin: 0 0 6px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 22px;
          color: var(--color-navy-deep);
        }

        .admin-login__subtext {
          margin: -6px 0 0;
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }

        .admin-login__field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .admin-login__field-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .admin-login__field label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-navy-deep);
        }

        .admin-login__field input {
          font-family: var(--font-body);
          font-size: 14.5px;
          padding: 11px 13px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-login__field input:focus {
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px rgba(201, 151, 44, 0.15);
        }

        .admin-login__password-wrap {
          position: relative;
          display: flex;
        }

        .admin-login__password-wrap input {
          flex: 1;
          padding-right: 42px;
        }

        .admin-login__eye {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          background: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .admin-login__eye svg {
          width: 19px;
          height: 19px;
        }

        .admin-login__eye:hover {
          color: var(--color-steel);
        }

        .admin-login__warning {
          margin: 0;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          color: #9c6f1f;
        }

        .admin-login__link {
          border: none;
          background: none;
          padding: 0;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-steel);
          cursor: pointer;
        }

        .admin-login__link:hover {
          color: var(--color-gold);
          text-decoration: underline;
        }

        .admin-login__error {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13.5px;
          color: #9c3b2f;
        }

        .admin-login__success {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #1e7a4c;
          background: rgba(30, 122, 76, 0.1);
          border-radius: 8px;
          padding: 9px 12px;
        }

        .admin-login__submit {
          border: none;
          border-radius: 999px;
          color: #fff;
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 600;
          padding: 12px 20px;
          background: linear-gradient(135deg, var(--color-navy-deep), var(--color-steel));
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .admin-login__submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(11, 30, 61, 0.3);
        }

        .admin-login__submit:disabled {
          opacity: 0.65;
          cursor: default;
        }

        .admin-login__submit--secondary {
          margin-top: 4px;
        }

        .admin-login__back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: center;
          border: none;
          background: none;
          padding: 4px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .admin-login__back svg {
          width: 15px;
          height: 15px;
        }

        .admin-login__back:hover {
          color: var(--color-steel);
        }
      `}</style>
    </div>
  );
}