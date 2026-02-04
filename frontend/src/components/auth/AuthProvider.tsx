'use client';

import { useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { getAuthCookie, setAuthCookie, removeAuthCookie, isAuthenticated as checkIsAuthenticated, decodeAuthToken } from '@/lib/auth';
import { AuthResponse, User } from '@/lib/types';
import { AuthContext } from '@/hooks/useAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Check authentication status on mount and set user if authenticated
  useEffect(() => {
    setMounted(true);

    const checkAuthStatus = async () => {
      if (checkIsAuthenticated()) {
        try {
          // Try to get user info from the API using the stored token
          const token = getAuthCookie();
          if (token) {
            // Decode the token to get user info without making an API call
            const decoded = decodeAuthToken(token);
            if (decoded) {
              const userInfo: User = {
                id: decoded.sub || decoded.userId || decoded.id,
                email: decoded.email || '',
                name: decoded.name || decoded.username || '',
                createdAt: new Date(decoded.createdAt || Date.now()),
                updatedAt: new Date(decoded.updatedAt || Date.now()),
              };
              setUser(userInfo);
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          // If there's an error, clear the token
          removeAuthCookie();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  const signin = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiClient.signin(email, password);

      // Store the token
      setAuthCookie(response.token);

      // Set the user in context
      const userInfo: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(userInfo);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response: AuthResponse = await apiClient.signup(email, password, name);

      // Store the token
      setAuthCookie(response.token);

      // Set the user in context
      const userInfo: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(userInfo);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const signout = async () => {
    try {
      // Call the API to sign out (optional, depending on backend implementation)
      await apiClient.signout();
    } catch (error) {
      console.error('Error during sign out API call:', error);
      // Continue with local sign out even if API call fails
    } finally {
      // Remove the token from storage
      removeAuthCookie();

      // Clear the user from context
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return checkIsAuthenticated();
  };

  const value = {
    user,
    loading,
    signin,
    signup,
    signout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;