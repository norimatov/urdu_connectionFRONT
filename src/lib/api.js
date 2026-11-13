const BASE = '/api';
const KEYS = { user: 'uc_token', admin: 'uc_admin_token' };

export const getToken = (scope = 'user') => localStorage.getItem(KEYS[scope]);
export const setToken = (token, scope = 'user') =>
  token ? localStorage.setItem(KEYS[scope], token) : localStorage.removeItem(KEYS[scope]);

export async function api(path, { method = 'GET', body, admin = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken(admin ? 'admin' : 'user');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Xatolik yuz berdi');
    err.status = res.status;
    throw err;
  }
  return data;
}
