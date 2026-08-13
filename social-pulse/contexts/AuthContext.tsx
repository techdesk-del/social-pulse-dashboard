'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCurrentSession, loginUserApi, logoutUserApi, registerUserApi } from '../lib/auth';
import type { Session } from '../lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUserApi(email, password);
    if (result.ok && result.session) {
      setSession(result.session);
      router.replace('/');
    }
    return { ok: result.ok, error: result.error };
  }, [router]);

  const logout = useCallback(async () => {
    await logoutUserApi();
    setSession(null);
    router.replace('/login');
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerUserApi(name, email, password);
    if (result.ok && result.session) {
      setSession(result.session);
      router.replace('/');
    }
    return { ok: result.ok, error: result.error };
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
