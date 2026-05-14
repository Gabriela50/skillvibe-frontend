import { createContext, useContext, useState, type ReactNode } from 'react';
import { type UserResponseDTO, authApi } from '../services/api';

interface AuthContextType {
  user: UserResponseDTO | null;
  token: string | null;
  login: (token: string, user: UserResponseDTO) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('skillvibes_token')
  );
  const [user, setUser] = useState<UserResponseDTO | null>(() => {
    const stored = localStorage.getItem('skillvibes_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, newUser: UserResponseDTO) => {
    localStorage.setItem('skillvibes_token', newToken);
    localStorage.setItem('skillvibes_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('skillvibes_token');
    localStorage.removeItem('skillvibes_user');
    setToken(null);
    setUser(null);
  };

  const fetchUserData = async () => {
    if (!user?.id) return;
    try {
      const { data } = await authApi.getUser(user.id);
      setUser(data);
      localStorage.setItem('skillvibes_user', JSON.stringify(data));
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchUserData, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
