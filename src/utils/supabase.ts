import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// SecureStore adapter for Supabase persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Direct connection to Supabase project
const supabaseUrl = 'https://dndpwembplcevpmcphhv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZHB3ZW1icGxjZXZwbWNwaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTIyOTcsImV4cCI6MjA2MzM2ODI5N30.A0oyeDjjP3z8ENwDvAtHsTc3_L-iQFAx6qCrLr4Lgfs';

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    }
  }
); 