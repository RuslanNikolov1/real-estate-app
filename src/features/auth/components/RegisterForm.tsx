'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogo, FacebookLogo } from '@phosphor-icons/react';
import styles from './AuthModal.module.scss';

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Паролите не съвпадат');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Паролата трябва да бъде поне 6 символа');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setError(error);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Възникна грешка. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Възникна грешка с Google регистрация.');
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    try {
      await signInWithFacebook();
    } catch (err) {
      setError('Възникна грешка с Facebook регистрация.');
    }
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Създайте профил</h2>
      <p className={styles.formSubtitle}>Регистрирайте се безплатно</p>

      <form onSubmit={handleSubmit} className={styles.formFields}>
        <div className={styles.field}>
          <label htmlFor="register-email" className={styles.label}>
            Имейл
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={styles.input}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password" className={styles.label}>
            Парола
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-confirm-password" className={styles.label}>
            Повторете паролата
          </label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Регистрирай се'}
        </button>
      </form>

      <div className={styles.divider}>
        <span>ИЛИ</span>
      </div>

      <div className={styles.oauthButtons}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className={styles.oauthButton}
        >
          <GoogleLogo size={20} weight="bold" />
          <span>Продължи с Google</span>
        </button>

        <button
          type="button"
          onClick={handleFacebookSignIn}
          className={styles.oauthButton}
        >
          <FacebookLogo size={20} weight="fill" />
          <span>Продължи с Facebook</span>
        </button>
      </div>
    </div>
  );
}
