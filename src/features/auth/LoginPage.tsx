'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './LoginPage.module.scss';

const loginSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  password: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл адрес'),
  password: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
  confirmPassword: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролите не съвпадат',
  path: ['confirmPassword'],
});

const resetPasswordSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: errorsRegister },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message || 'Грешка при влизане. Моля, опитайте отново.');
        return;
      }

      if (authData.user) {
        setSuccess('Успешно влизане!');
        // Redirect to admin panel or home
        setTimeout(() => {
          router.push('/admin/properties');
        }, 1000);
      }
    } catch (err) {
      setError('Неочаквана грешка. Моля, опитайте отново.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (authError) {
        setError(authError.message || 'Грешка при регистрация. Моля, опитайте отново.');
        return;
      }

      if (authData.user) {
        setSuccess('Регистрацията е успешна! Моля, проверете имейла си за потвърждение.');
      }
    } catch (err) {
      setError('Неочаквана грешка. Моля, опитайте отново.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || 'Грешка при изпращането на имейла. Моля, опитайте отново.');
        return;
      }

      setSuccess('Имейл за възстановяване на парола е изпратен! Моля, проверете пощата си.');
    } catch (err) {
      setError('Неочаквана грешка. Моля, опитайте отново.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.card}
          >
            <div className={styles.header}>
              <h1 className={styles.title}>
                {mode === 'login' && 'Вход'}
                {mode === 'register' && 'Регистрация'}
                {mode === 'reset' && 'Забравена парола'}
              </h1>
              <p className={styles.subtitle}>
                {mode === 'login' && 'Влезте в профила си'}
                {mode === 'register' && 'Създайте нов профил'}
                {mode === 'reset' && 'Възстановете паролата си'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.errorMessage}
              >
                <AlertCircle size={20} />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successMessage}
              >
                <span>{success}</span>
              </motion.div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleSubmitLogin(onLogin)} className={styles.form}>
                <div className={styles.inputGroup}>
                  <Mail size={20} className={styles.inputIcon} />
                  <Input
                    type="email"
                    placeholder="Имейл"
                    {...registerLogin('email')}
                    error={errorsLogin.email?.message}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Lock size={20} className={styles.inputIcon} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Парола"
                    {...registerLogin('password')}
                    error={errorsLogin.password?.message}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className={styles.forgotPassword}
                >
                  Забравена парола?
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  <LogIn size={20} />
                  {isLoading ? 'Влизане...' : 'Влез'}
                </Button>
                <div className={styles.divider}>
                  <span>или</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setMode('register')}
                  className={styles.switchButton}
                >
                  <UserPlus size={20} />
                  Създай профил
                </Button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleSubmitRegister(onRegister)} className={styles.form}>
                <div className={styles.inputGroup}>
                  <Input
                    type="text"
                    placeholder="Име"
                    {...registerRegister('name')}
                    error={errorsRegister.name?.message}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Mail size={20} className={styles.inputIcon} />
                  <Input
                    type="email"
                    placeholder="Имейл"
                    {...registerRegister('email')}
                    error={errorsRegister.email?.message}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Lock size={20} className={styles.inputIcon} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Парола"
                    {...registerRegister('password')}
                    error={errorsRegister.password?.message}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className={styles.inputGroup}>
                  <Lock size={20} className={styles.inputIcon} />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Потвърди парола"
                    {...registerRegister('confirmPassword')}
                    error={errorsRegister.confirmPassword?.message}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  <UserPlus size={20} />
                  {isLoading ? 'Регистрация...' : 'Регистрирай се'}
                </Button>
                <div className={styles.divider}>
                  <span>или</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setMode('login')}
                  className={styles.switchButton}
                >
                  <LogIn size={20} />
                  Влез в профил
                </Button>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleSubmitReset(onResetPassword)} className={styles.form}>
                <p className={styles.resetDescription}>
                  Въведете имейл адреса си и ние ще изпратим линк за възстановяване на паролата.
                </p>
                <div className={styles.inputGroup}>
                  <Mail size={20} className={styles.inputIcon} />
                  <Input
                    type="email"
                    placeholder="Имейл"
                    {...registerReset('email')}
                    error={errorsReset.email?.message}
                    className={styles.input}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  <Mail size={20} />
                  {isLoading ? 'Изпращане...' : 'Изпрати имейл'}
                </Button>
                <div className={styles.divider}>
                  <span>или</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setMode('login')}
                  className={styles.switchButton}
                >
                  <LogIn size={20} />
                  Назад към вход
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}








