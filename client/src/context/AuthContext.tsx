import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Wallet } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setWallet: React.Dispatch<React.SetStateAction<Wallet | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ccr_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('ccr_token')) {
        setUser(null);
        setWallet(null);
        setIsLoading(false);
        return;
      }

      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setWallet(res.wallet);
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      localStorage.removeItem('ccr_token');
      setToken(null);
      setUser(null);
      setWallet(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('ccr_token', res.token);
        setToken(res.token);
        setUser(res.user);
        await refreshUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('ccr_token', res.token);
        setToken(res.token);
        setUser(res.user);
        await refreshUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ccr_token');
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setWallet,
      }}
    >
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
