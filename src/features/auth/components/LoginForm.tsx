'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogo } from '@phosphor-icons/react';
import styles from './AuthModal.module.scss';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

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
      setError('Възникна грешка с Google вход.');
    }
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Добре дошли обратно</h2>
      <p className={styles.formSubtitle}>Влезте в профила си</p>

      <form onSubmit={handleSubmit} className={styles.formFields}>
        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.label}>
            Имейл
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className={styles.label}>
            Парола
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
            required
            autoComplete="current-password"
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
          {loading ? 'Вход...' : 'Влез'}
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
          aria-label="Влез с Google"
        >
          <GoogleLogo size={24} weight="bold" />
          <span>Google</span>
        </button>
      </div>
    </div>
  );
}
