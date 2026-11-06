import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default accounts corresponding to the backend
const ROLE_ACCOUNTS: Record<UserRole, { email: string; pass: string; name: string }> = {
  ADMIN: { email: 'admin@smartpetrol.com', pass: 'admin123', name: 'Chief Executive Officer' },
  MANAGER: { email: 'manager@smartpetrol.com', pass: 'manager123', name: 'Station Operations Manager' },
  OPERATOR: { email: 'operator@smartpetrol.com', pass: 'operator123', name: 'Senior Pump Operator' },
  ANALYST: { email: 'analyst@smartpetrol.com', pass: 'analyst123', name: 'Lead Data & BI Analyst' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const savedToken = getAuthToken();
        if (savedToken) {
          const profile = await authApi.getProfile();
          setUser(profile);
          setToken(savedToken);
        } else {
          // Initialize with default admin session for seamless enterprise demo experience
          await login(ROLE_ACCOUNTS.ADMIN.email, ROLE_ACCOUNTS.ADMIN.pass);
        }
      } catch (err) {
        console.warn('Auto-login fallback engaging default admin:', err);
        try {
          await login(ROLE_ACCOUNTS.ADMIN.email, ROLE_ACCOUNTS.ADMIN.pass);
        } catch {
          clearAuthToken();
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, pass);
      setAuthToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    const creds = ROLE_ACCOUNTS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
