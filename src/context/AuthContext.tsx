import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, ApiError } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  quickLogin: (role: UserRole) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pulsefit_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('pulsefit_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<{ user: User }>('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('pulsefit_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string, expectedRole?: UserRole): Promise<User> => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
      expectedRole,
    });
    localStorage.setItem('pulsefit_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: any): Promise<User> => {
    const data = await api.post<{ token: string; user: User }>('/auth/register', payload);
    localStorage.setItem('pulsefit_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const quickLogin = async (role: UserRole): Promise<User> => {
    let email = 'marcus@pulsefit.com';
    let pass = 'user123';

    if (role === 'ADMIN') {
      email = 'admin@pulsefit.com';
      pass = 'admin123';
    } else if (role === 'COACH') {
      email = 'coach.alex@pulsefit.com';
      pass = 'coach123';
    }

    return await login(email, pass, role);
  };

  const logout = () => {
    localStorage.removeItem('pulsefit_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        quickLogin,
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
