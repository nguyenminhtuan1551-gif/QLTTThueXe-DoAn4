'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('car_rental_admin_token');
        const storedUser = localStorage.getItem('car_rental_admin_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          try {
            const res = await authService.getMe();
            if (res.success && res.data) {
              setUser(res.data);
              localStorage.setItem('car_rental_admin_user', JSON.stringify(res.data));
            }
          } catch (e) {
            console.log('Session sync note:', e);
          }
        }
      } catch (error) {
        console.warn('Lỗi khôi phục phiên quản trị:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const authToken = response.data.token;
        const authUser: AdminUser = (response.data as any).user || {
          id: (response.data as any).id || '',
          fullName: (response.data as any).fullName || '',
          email: (response.data as any).email || '',
          phone: (response.data as any).phone || '',
          role: (response.data as any).role || 'Nhân viên',
          scope: 'admin',
        };

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('car_rental_admin_token', authToken);
        localStorage.setItem('car_rental_admin_user', JSON.stringify(authUser));

        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Đăng nhập không thành công.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('car_rental_admin_token');
      localStorage.removeItem('car_rental_admin_user');
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
