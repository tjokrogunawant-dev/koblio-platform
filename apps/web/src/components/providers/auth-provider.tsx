'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getStoredToken, setStoredToken, clearStoredToken, isTokenExpired } from '@/lib/auth';
import type { AuthUser } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser, expiresIn: number) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => undefined,
  logout: () => undefined,
  updateUser: () => undefined,
});

const USER_KEY = 'koblio_user';

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken && !isTokenExpired()) {
      setToken(storedToken);
      setUser(getStoredUser());
    } else {
      clearStoredToken();
    }
  }, []);

  const login = useCallback((newToken: string, newUser: AuthUser, expiresIn: number) => {
    setStoredToken(newToken, expiresIn);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    // Set session cookie so middleware can detect auth
    document.cookie = 'koblio_session=1; path=/; SameSite=Lax';
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem(USER_KEY);
    // Clear session cookie
    document.cookie =
      'koblio_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
