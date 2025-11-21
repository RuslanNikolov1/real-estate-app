'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Updater<T> = Partial<T> | ((prev: T) => T);

export function useFilterState<T>(createInitial: () => T, onChange?: (value: T) => void, initialValues?: Partial<T>) {
  const factoryRef = useRef(createInitial);
  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    factoryRef.current = createInitial;
    initialValuesRef.current = initialValues;
  }, [createInitial, initialValues]);

  const [filters, setFilters] = useState<T>(() => {
    const base = factoryRef.current();
    if (initialValuesRef.current) {
      return { ...base, ...initialValuesRef.current };
    }
    return base;
  });

  // Apply initial values when they change (e.g., from URL restoration)
  useEffect(() => {
    if (initialValuesRef.current) {
      setFilters(prev => {
        // Only update if values actually changed to avoid unnecessary re-renders
        const hasChanges = Object.keys(initialValuesRef.current!).some(
          key => prev[key as keyof T] !== initialValuesRef.current![key as keyof T]
        );
        if (hasChanges) {
          return { ...prev, ...initialValuesRef.current };
        }
        return prev;
      });
    }
  }, [initialValues]);

  const updateFilters = useCallback(
    (updater: Updater<T>) => {
      setFilters(prev => {
        if (typeof updater === 'function') {
          return (updater as (prevState: T) => T)(prev);
        }

        return { ...prev, ...updater };
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(factoryRef.current());
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange(filters);
    }
  }, [filters, onChange]);

  return { filters, setFilters, updateFilters, resetFilters };
}

