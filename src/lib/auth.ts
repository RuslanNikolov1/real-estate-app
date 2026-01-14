import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Handle authentication errors and return user-friendly messages in Bulgarian
 */
export function handleAuthError(error: AuthError | null): string | null {
  if (!error) return null;

  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Невалиден имейл или парола',
    'User already registered': 'Потребителят вече е регистриран',
    'Email not confirmed': 'Имейлът не е потвърден',
    'Invalid email': 'Невалиден имейл адрес',
    'Password should be at least 6 characters': 'Паролата трябва да бъде поне 6 символа',
    'Signup requires a valid password': 'Регистрацията изисква валидна парола',
    'User not found': 'Потребителят не е намерен',
    'Email rate limit exceeded': 'Превишен лимит на имейл заявки. Моля, опитайте по-късно.',
    'Invalid refresh token': 'Невалиден токен за обновяване',
  };

  return errorMessages[error.message] || 'Възникна грешка. Моля, опитайте отново.';
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return user;
  } catch (err) {
    console.error('Error getting user:', err);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Error getting session:', err);
    return null;
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Error refreshing session:', err);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: handleAuthError(error) };
  } catch (err) {
    console.error('Error signing out:', err);
    return { error: 'Възникна грешка при излизане.' };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Паролата трябва да бъде поне 6 символа' };
  }

  return { valid: true };
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}
