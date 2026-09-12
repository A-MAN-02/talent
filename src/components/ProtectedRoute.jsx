import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminToken, verifyAdminToken } from '../lib/api';

// Wrap any admin page with this. Redirects to /admin/login if there's no
// valid session, so a bookmarked /admin link never leaks the dashboard.
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking'); // checking | ok | invalid

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setStatus('invalid');
      return;
    }
    verifyAdminToken(token)
      .then(() => setStatus('ok'))
      .catch(() => setStatus('invalid'));
  }, []);

  if (status === 'checking') {
    return <div style={{ padding: '96px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Checking session&hellip;</div>;
  }

  if (status === 'invalid') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}