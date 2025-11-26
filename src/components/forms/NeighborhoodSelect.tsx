import { ChangeEvent, useMemo } from 'react';
import styles from './NeighborhoodSelect.module.scss';
import { getNeighborhoodsByCity } from '@/lib/neighborhoods';

type NeighborhoodSelectProps = {
  city?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  multiple?: boolean;
  name?: string;
  error?: string;
};

export function NeighborhoodSelect({
  city,
  value,
  onChange,
  label = 'Квартал',
  disabled,
  placeholder = 'Изберете',
  multiple = false,
  name,
  error,
}: NeighborhoodSelectProps) {
  const options = useMemo(() => getNeighborhoodsByCity(city), [city]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selected = Array.from(event.target.selectedOptions).map((opt) => opt.value);
      onChange(selected);
      return;
    }

    onChange(event.target.value);
  };

  const resolvedValue = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : typeof value === 'string'
    ? value
    : Array.isArray(value)
    ? value[0] ?? ''
    : '';

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        className={styles.select}
        onChange={handleChange}
        value={resolvedValue}
        multiple={multiple}
        disabled={!options.length || disabled}
        name={name}
      >
        {!multiple && (
          <option value="">{options.length ? placeholder : 'Няма налични квартали'}</option>
        )}
        {options.map((neighborhood) => (
          <option key={neighborhood} value={neighborhood}>
            {neighborhood}
          </option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}




