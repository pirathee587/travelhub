import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (userData: any, authToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('travelhub_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse travelhub_user from localStorage', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('travelhub_token'));

  const login = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('travelhub_user', JSON.stringify(userData));
    localStorage.setItem('travelhub_token', authToken);
    // Also set 'token' for Admin compatibility
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('travelhub_user');
    localStorage.removeItem('travelhub_token');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
