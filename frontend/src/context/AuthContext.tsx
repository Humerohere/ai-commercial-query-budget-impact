"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { showError, showSuccess } from '@/utils/toast';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { id: string; email: string; created_at: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }: { children: ReactNode }) => { // Corrected type for children
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; email: string; created_at: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check token validity on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get('/api/v1/auth/me');
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('auth_token');
          setIsLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      await api.post('/api/v1/auth/signup', {
        email,
        password,
      });
      // After successful signup, automatically login
      await login(email, password);
    } catch (error: unknown) {
      let errorMessage = 'Signup failed';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use FormData for OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email); // OAuth2 uses 'username' field
      formData.append('password', password);

      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', access_token);
      
      // Fetch user profile
      const userResponse = await api.get('/api/v1/auth/me');
      setUser(userResponse.data);
      setIsLoggedIn(true);
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || errorMessage;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear token and state
      localStorage.removeItem('auth_token');
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/api/v1/auth/me');
      localStorage.removeItem('auth_token'); // Clear auth token
      setIsLoggedIn(false);
      setUser(null);
      showSuccess('Account deleted successfully');
    } catch (error) {
      console.error('Account deletion failed:', error);
      showError('Failed to delete account. Please try again.');
      throw new Error('Failed to delete account.');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, signup, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export axios instance for use in other components
export { api };