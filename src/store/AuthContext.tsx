import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/schema';
import { supabase } from '../utils/supabase';
import { getCurrentUser, signIn, signOut, signUp } from '../api/supabaseService';
import { LoginCredentials, RegisterForm } from '../types/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (form: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'hifz_tracker_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user from AsyncStorage on startup
    const loadUser = async () => {
      try {
        const userJSON = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login with:', credentials.username);
      const { user: userData } = await signIn(credentials);
      
      if (!userData) {
        throw new Error('No user data returned from login');
      }
      
      console.log('Login successful, user data:', userData);
      setUser(userData);
      
      // Save user to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Login error in context:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (form: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUp(form);
      // User will need to login after registration
    } catch (error: any) {
      console.error('Registration error in context:', error);
      
      // Handle specific error types
      if (error.code === 'PGRST204') {
        setError('Database error: Schema mismatch. Please contact support.');
      } else if (error.code === '23505') {
        setError('Email already in use. Please try another email address.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again later.');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // No need to call signOut with Supabase, just clear local storage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 