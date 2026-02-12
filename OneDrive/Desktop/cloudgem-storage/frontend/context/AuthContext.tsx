import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { apiRequest, setAccessToken } from '../services/api';
import { ENDPOINTS } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      // Try to refresh token on mount to check if session exists
      const data = await apiRequest<{ accessToken: string; user: User }>(
        ENDPOINTS.REFRESH,
        'POST'
      );
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (error) {
      // Not authenticated
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>(ENDPOINTS.LOGIN, 'POST', credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>(ENDPOINTS.REGISTER, 'POST', credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest(ENDPOINTS.LOGOUT, 'POST');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};