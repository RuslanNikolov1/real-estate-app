'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Updater<T> = Partial<T> | ((prev: T) => T);

export function useFilterState<T>(createInitial: () => T, onChange?: (value: T) => void) {
  const factoryRef = useRef(createInitial);

  useEffect(() => {
    factoryRef.current = createInitial;
  }, [createInitial]);

  const [filters, setFilters] = useState<T>(() => factoryRef.current());

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

