export interface Session {
  userId: string;
  email: string;
  name: string;
}

export async function fetchCurrentSession(): Promise<Session | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data.session : null;
  } catch {
    return null;
  }
}

export async function registerUserApi(
  name: string,
  email: string,
  password: string
): Promise<{ ok: boolean; session?: Session; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function loginUserApi(
  email: string,
  password: string
): Promise<{ ok: boolean; session?: Session; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function logoutUserApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network errors on logout
  }
}
