import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.div
      whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      style={{ display: 'inline-block' }}
    >
      <button
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className={styles.loader}>
            <span></span>
          </span>
        ) : (
          children
        )}
      </button>
    </motion.div>
  );
}

