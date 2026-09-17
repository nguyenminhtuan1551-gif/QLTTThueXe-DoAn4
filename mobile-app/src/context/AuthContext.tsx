import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { AuthUser, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo và kiểm tra phiên đăng nhập đã lưu trong AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Thử tải dữ liệu mới nhất từ server
          try {
            const response = await authApi.getMe();
            if (response.success && response.data) {
              setUser(response.data);
              await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
            }
          } catch (fetchError) {
            // Nếu token hết hạn thì interceptor đã xóa storage
            console.log('Session sync notice:', fetchError);
          }
        }
      } catch (error) {
        console.warn('Lỗi khi khôi phục trạng thái đăng nhập:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        const authToken = response.data.token;
        const authUser: AuthUser = response.data.user || {
          id: response.data.id || '',
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          role: (response.data.role as any) || 'Customer',
          scope: 'customer',
        };

        setToken(authToken);
        setUser(authUser);

        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authUser));
      } else {
        throw new Error(response.message || 'Đăng nhập không thành công.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const authToken = response.data.token;
        const authUser: AuthUser = response.data.user || {
          id: response.data.id || '',
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          role: (response.data.role as any) || 'Customer',
          scope: 'customer',
        };

        setToken(authToken);
        setUser(authUser);

        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authUser));
      } else {
        throw new Error(response.message || 'Đăng ký tài khoản không thành công.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      }
    } catch (error) {
      console.warn('Lỗi làm mới profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile,
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
