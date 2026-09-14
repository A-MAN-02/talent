import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminResetPassword } from '../../lib/api';

const MIN_PASSWORD_LENGTH = 8;

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await adminResetPassword(token, password);
      setDone(true);
      // Give them a moment to see the confirmation before sending them
      // back to log in with the new password.
      setTimeout(() => {
        navigate('/admin/login', { state: { resetSuccess: true }, replace: true });
      }, 1600);
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      {!done ? (
        <form className="admin-login__card" onSubmit={handleSubmit}>
          <p className="admin-login__eyebrow">Admin</p>
          <h1 className="admin-login__heading">Set a new password</h1>
          <p className="admin-login__subtext">Choose a new password for your admin account.</p>

          <div className="admin-login__field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              required
              autoFocus
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="admin-login__field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="admin-login__submit" disabled={loading}>
            {loading ? 'Resetting\u2026' : 'Reset password'}
          </button>
        </form>
      ) : (
        <div className="admin-login__card admin-login__card--done">
          <p className="admin-login__eyebrow">Admin</p>
          <h1 className="admin-login__heading">Password updated</h1>
          <p className="admin-login__subtext">
            Your password has been reset. Taking you to the login page&hellip;
          </p>
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

        .admin-login__error {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13.5px;
          color: #9c3b2f;
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
      `}</style>
    </div>
  );
}