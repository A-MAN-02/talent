// Talks to the career backend (see /backend in this project).
// Set VITE_API_URL in your frontend .env — defaults to the local dev server.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const TOKEN_KEY = 'bharyat_admin_token';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(body?.error || `Something went wrong (${res.status})`);
  }
  return body;
}

function authHeaders(token, withJson = true) {
  const headers = { Authorization: `Bearer ${token}` };
  if (withJson) headers['Content-Type'] = 'application/json';
  return headers;
}

// ---------- Public: jobs + applications ----------

export function getJobs() {
  return request('/api/jobs');
}

export function getJob(id) {
  return request(`/api/jobs/${id}`);
}

export function submitApplication(formData) {
  return request('/api/applications', { method: 'POST', body: formData });
}

// ---------- Admin auth ----------

export async function adminLogin(email, password) {
  const data = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  setAdminToken(data.token);
  return data;
}

// Requests a password-reset email/link for the given admin account.
// Backend should always respond success-shaped (even for unknown emails)
// so this can't be used to enumerate valid admin accounts.
export function adminForgotPassword(email) {
  return request('/api/admin/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

// Completes a password reset using the token from the reset email/link.
export function adminResetPassword(resetToken, newPassword) {
  return request('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken, password: newPassword }),
  });
}

export function verifyAdminToken(token) {
  return request('/api/admin/me', { headers: authHeaders(token, false) });
}

// ---------- Admin: jobs ----------

export function getAllJobsAdmin(token) {
  return request('/api/jobs/admin/all', { headers: authHeaders(token, false) });
}

export function createJob(token, payload) {
  return request('/api/jobs', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateJob(token, id, payload) {
  return request(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteJob(token, id) {
  return request(`/api/jobs/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token, false),
  });
}

// ---------- Admin: applications ----------

export function getApplications(token) {
  return request('/api/applications', { headers: authHeaders(token, false) });
}

export function updateApplicationStatus(token, id, status) {
  return request(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export async function downloadResume(token, id, filename) {
  const res = await fetch(`${API_BASE}/api/applications/${id}/resume`, {
    headers: authHeaders(token, false),
  });
  if (!res.ok) throw new Error('Could not download this resume');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'resume';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}