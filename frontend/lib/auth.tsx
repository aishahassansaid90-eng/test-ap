'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ApiResponse } from '@/types';
import { apiClient } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await apiClient<ApiResponse<{ user: User }>>('/auth/me');
      if (response && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bakka_token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.user) {
      setUser(res.data.user);
      if (typeof window !== 'undefined' && res.data.token) {
        localStorage.setItem('bakka_token', res.data.token);
      }

      // Navigate to role dashboard
      switch (res.data.user.role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'STAFF':
          router.push('/staff');
          break;
        case 'STUDENT':
          router.push('/student');
          break;
        default:
          router.push('/');
      }
    }
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout call failed', e);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bakka_token');
      }
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
