const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
};

async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const AuthApi = {
  register: (email: string, password: string, name?: string) =>
    api<{ id: string; email: string }>(`/api/auth/register`, {
      method: 'POST',
      body: { email, password, name },
    }),
  login: (email: string, password: string) =>
    api<{ token: string; user: { id: string; email: string; name?: string; roles: string[] } }>(`/api/auth/login`, {
      method: 'POST',
      body: { email, password },
    }),
};

export type ActivityLog = {
  _id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export const ActivityApi = {
  create: (token: string, action: string, metadata?: Record<string, unknown>) =>
    api<ActivityLog>(`/api/activity`, {
      method: 'POST',
      token,
      body: { action, metadata },
    }),
  listMine: (token: string) => api<ActivityLog[]>(`/api/activity`, { token }),
};

