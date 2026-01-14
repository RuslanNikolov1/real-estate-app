'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/contexts/AuthContext';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle auth errors and return user-friendly messages
  const handleAuthError = (error: AuthError | null): string | null => {
    if (!error) return null;

    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Невалиден имейл или парола',
      'User already registered': 'Потребителят вече е регистриран',
      'Email not confirmed': 'Имейлът не е потвърден',
      'Invalid email': 'Невалиден имейл адрес',
      'Password should be at least 6 characters': 'Паролата трябва да бъде поне 6 символа',
    };

    return errorMessages[error.message] || 'Възникна грешка. Моля, опитайте отново.';
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: handleAuthError(error) };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: 'Възникна грешка. Моля, опитайте отново.' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      return { error: handleAuthError(error) };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: 'Възникна грешка. Моля, опитайте отново.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Facebook sign in error:', error);
      }
    } catch (err) {
      console.error('Facebook sign in error:', err);
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
