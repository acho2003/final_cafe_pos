import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContextType, User } from '../types';
import { apiService } from '../services/apiService';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      if (data && data.user && data.token) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      // Let the login page handle showing the error message
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }, []);

  const value = { currentUser, login, logout, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
