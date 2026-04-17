import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kkrfqweqapnhcnjlzmvm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcmZxd2VxYXBuaGNuamx6bXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzg1NzEsImV4cCI6MjA5MTg1NDU3MX0.pz2EkX-xNE2NFtCaUMNKR6BinqJnZLM61K1QUs-g4ZM';
const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
}

interface UseSupabaseAuthReturn {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  getSession: () => Promise<any>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is admin based on role in user_metadata
  const isAdmin = user?.user_metadata?.role === 'admin';

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  return {
    user,
    isAdmin,
    isLoading,
    signOut,
    signIn,
    getSession,
  };
}

export { supabase };
