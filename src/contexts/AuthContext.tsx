import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useApp } from './AppDataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { state } = useApp();

  useEffect(() => {
    const savedUserId = localStorage.getItem('loggedUserId');
    if (savedUserId && state.users.length > 0) {
      const user = state.users.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [state.users]);

  const login = async (email: string, password?: string) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('loggedUserId', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loggedUserId');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
