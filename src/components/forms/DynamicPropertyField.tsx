'use client';

import { FieldConfig } from '@/lib/property-schemas';
import { Input } from '@/components/ui/Input';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control, useWatch } from 'react-hook-form';
import styles from './DynamicPropertyField.module.scss';

interface DynamicPropertyFieldProps {
  field: FieldConfig;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  value?: any;
  onFeaturesChange?: (features: string[]) => void;
  selectedFeatures?: string[];
}

export function DynamicPropertyField({
  field,
  register,
  errors,
  setValue,
  value,
  onFeaturesChange,
  selectedFeatures = [],
}: DynamicPropertyFieldProps) {
  const fieldError = errors[field.key]?.message 
    ? String(errors[field.key]?.message)
    : undefined;

  switch (field.type) {
    case 'text':
      return (
        <Input
          label={field.label + (field.required ? ' *' : '')}
          placeholder={field.placeholder}
          {...register(field.key)}
          error={fieldError}
        />
      );

    case 'number':
      return (
        <Input
          label={field.label + (field.required ? ' *' : '')}
          type="number"
          placeholder={field.placeholder}
          {...register(field.key, { valueAsNumber: true })}
          error={fieldError}
          min={field.min}
          max={field.max}
        />
      );

    case 'select':
      return (
        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            {field.label} {field.required && '*'}
          </label>
          <select
            {...register(field.key)}
            className={styles.select}
            value={value || ''}
            onChange={(e) => setValue(field.key, e.target.value)}
            required={field.required}
          >
            <option value="">Изберете</option>
            {field.options?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError && <p className={styles.errorMessage}>{fieldError}</p>}
        </div>
      );

    case 'multi-select':
      if (field.key === 'features') {
        // Render features as checkboxes
        return (
          <div className={styles.featuresWrapper}>
            <label className={styles.label}>
              {field.label} {field.required && '*'}
            </label>
            <div className={styles.featuresGrid}>
              {field.options?.map((option) => {
                const isSelected = selectedFeatures.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.featureCard} ${isSelected ? styles.active : ''}`}
                    onClick={() => {
                      if (!onFeaturesChange) return;
                      const newFeatures = isSelected
                        ? selectedFeatures.filter((f) => f !== option.id)
                        : [...selectedFeatures, option.id];
                      onFeaturesChange(newFeatures);
                    }}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            {fieldError && <p className={styles.errorMessage}>{fieldError}</p>}
          </div>
        );
      }
      // For other multi-select fields, render as checkboxes
      return null;

    default:
      return null;
  }
}

