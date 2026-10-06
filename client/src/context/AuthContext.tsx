import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api, getAuthToken } from '../lib/api.js';

interface AuthContextType {
  currentUser: User | null;
  allPersonas: User[];
  loading: boolean;
  switchPersona: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allPersonas, setAllPersonas] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      setLoading(true);
      // Fetch all available personas
      const usersRes = await api.getAllUsers();
      setAllPersonas(usersRes.users || []);

      const token = getAuthToken();
      if (token) {
        try {
          const meRes = await api.getMe();
          setCurrentUser(meRes.user);
        } catch {
          // Token expired or invalid, default to Aarav Mehta
          await switchToDefault(usersRes.users);
        }
      } else {
        await switchToDefault(usersRes.users);
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchToDefault = async (users: User[]) => {
    const aarav = users.find((u) => u.email.includes('aarav')) || users[0];
    if (aarav) {
      const loginRes = await api.switchUser(aarav.email);
      setCurrentUser(loginRes.user);
    }
  };

  const switchPersona = async (email: string) => {
    try {
      setLoading(true);
      const res = await api.switchUser(email);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (currentUser) {
      const res = await api.getMe();
      setCurrentUser(res.user);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPersonas,
        loading,
        switchPersona,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
