// Same-origin by default (Vite proxy in dev, nginx in prod). Avoid localhost —
// that triggers Chrome's "Access other apps on this device" on the live site.
const API_URL = import.meta.env.VITE_API_URL ?? '';

export function getApiUrl(path = '') {
  return `${API_URL.replace(/\/$/, '')}${path}`;
}

export async function fetchMe() {
  const res = await fetch(getApiUrl('/auth/me'), { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load session');
  return res.json();
}

export async function logout() {
  const res = await fetch(getApiUrl('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export function googleSignInUrl() {
  return getApiUrl('/auth/google');
}

export async function authStatus() {
  const res = await fetch(getApiUrl('/auth/status'));
  if (!res.ok) return { googleOAuth: false, emailAuth: true };
  return res.json();
}

async function postAuth(path, body) {
  let res;
  try {
    res = await fetch(getApiUrl(path), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Network/connection failure (server unreachable) — show a friendly message
    // instead of the raw "Failed to fetch".
    throw new Error('No records found');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No records found');
  return data;
}

export function signupRequest(payload) {
  return postAuth('/auth/signup', payload);
}

export function loginRequest(payload) {
  return postAuth('/auth/login', payload);
}

export function verifyOtpRequest(payload) {
  return postAuth('/auth/verify-otp', payload);
}

export function resendOtpRequest(email) {
  return postAuth('/auth/resend-otp', { email });
}

export async function updateProfileRequest(payload) {
  let res;
  try {
    res = await fetch(getApiUrl('/auth/profile'), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No records found');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not update profile');
  return data;
}

export async function fetchWallet() {
  const res = await fetch(getApiUrl('/api/wallet'), { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load wallet');
  return res.json();
}

export async function createBooking(payload) {
  const res = await fetch(getApiUrl('/api/bookings'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Booking failed');
  return data;
}

export async function fetchBookings() {
  const res = await fetch(getApiUrl('/api/bookings'), { credentials: 'include' });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export async function fetchStays() {
  const res = await fetch(getApiUrl('/api/stays'));
  if (!res.ok) throw new Error('Failed to load stays');
  return res.json();
}

export async function fetchStay(idOrSlug) {
  const res = await fetch(getApiUrl(`/api/stays/${encodeURIComponent(idOrSlug)}`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load stay');
  return res.json();
}

// ── Admin ──
export async function adminLogin(password) {
  const res = await fetch(getApiUrl('/api/admin/login'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function adminLogout() {
  await fetch(getApiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' });
}

export async function adminSession() {
  try {
    const res = await fetch(getApiUrl('/api/admin/session'), { credentials: 'include' });
    return res.ok;
  } catch {
    // API unreachable — treat as logged out so the UI shows the login screen.
    return false;
  }
}

export async function adminFetchStays() {
  const res = await fetch(getApiUrl('/api/admin/stays'), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load listings');
  return res.json();
}

export async function adminSaveStay(id, payload) {
  const url = id ? `/api/admin/stays/${id}` : '/api/admin/stays';
  const res = await fetch(getApiUrl(url), {
    method: id ? 'PUT' : 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Save failed');
  return data;
}

export async function adminUploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(getApiUrl('/api/admin/upload'), {
    method: 'POST',
    credentials: 'include',
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data; // { url, type }
}

export async function adminDeleteStay(id) {
  const res = await fetch(getApiUrl(`/api/admin/stays/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Delete failed');
  }
  return res.json();
}
