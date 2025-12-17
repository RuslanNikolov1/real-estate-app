import { ChangeEvent, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import styles from './NeighborhoodSelect.module.scss';
import { getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { CaretDown, Check } from '@phosphor-icons/react';

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
  required?: boolean;
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
  required = false,
}: NeighborhoodSelectProps) {
  const options = useMemo(() => getNeighborhoodsByCity(city), [city]);
  const selectRef = useRef<HTMLSelectElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selected = Array.from(event.target.selectedOptions).map((opt) => opt.value);
      onChange(selected);
      return;
    }

    onChange(event.target.value);
    setIsOpen(false);
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

  // For multiple select, manually set selected options since React doesn't support value={array}
  useEffect(() => {
    if (multiple && selectRef.current) {
      const select = selectRef.current;
      // Clear all selections first
      Array.from(select.options).forEach((option) => {
        option.selected = false;
      });
      // Set selected options based on resolvedValue
      if (Array.isArray(resolvedValue)) {
        resolvedValue.forEach((val) => {
          const option = Array.from(select.options).find((opt) => opt.value === val);
          if (option) {
            option.selected = true;
          }
        });
      }
    }
  }, [multiple, resolvedValue, options]);

  // Handle toggle for custom multi-select
  const handleToggleNeighborhood = useCallback((neighborhood: string) => {
    if (!multiple) return;
    
    const current = Array.isArray(resolvedValue) ? resolvedValue : [];
    const isSelected = current.includes(neighborhood);
    
    if (isSelected) {
      onChange(current.filter((v) => v !== neighborhood));
    } else {
      onChange([...current, neighborhood]);
    }
  }, [multiple, resolvedValue, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!multiple || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [multiple, isOpen]);

  // Custom multi-select UI
  if (multiple) {
    const selectedCount = Array.isArray(resolvedValue) ? resolvedValue.length : 0;
    const displayText = selectedCount > 0 
      ? `${selectedCount} квартал${selectedCount > 1 ? 'а' : ''} избран${selectedCount > 1 ? 'и' : ''}`
      : placeholder;

    return (
      <div className={styles.container}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.requiredMarker}>*</span>}
          </label>
        )}
        <div className={styles.customMultiSelect}>
          <button
            ref={buttonRef}
            type="button"
            className={styles.selectButton}
            onClick={() => setIsOpen(!isOpen)}
            disabled={!options.length || disabled}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className={styles.selectButtonText}>{displayText}</span>
            <CaretDown 
              size={18} 
              weight="bold" 
              className={`${styles.caret} ${isOpen ? styles.caretOpen : ''}`}
            />
          </button>
          {isOpen && options.length > 0 && (
            <div ref={dropdownRef} className={styles.dropdown} role="listbox">
              {options.map((neighborhood) => {
                const isSelected = Array.isArray(resolvedValue) && resolvedValue.includes(neighborhood);
                return (
                  <button
                    key={neighborhood}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemSelected : ''}`}
                    onClick={() => handleToggleNeighborhood(neighborhood)}
                  >
                    <span className={styles.checkbox}>
                      {isSelected && <Check size={16} weight="bold" />}
                    </span>
                    <span className={styles.dropdownItemText}>{neighborhood}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  // Single select - use native select
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.requiredMarker}>*</span>}
        </label>
      )}
      <select
        ref={selectRef}
        className={styles.select}
        onChange={handleChange}
        value={typeof resolvedValue === 'string' ? resolvedValue : ''}
        disabled={!options.length || disabled}
        name={name}
        required={required}
      >
        <option value="">{options.length ? placeholder : 'Няма налични квартали'}</option>
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







