/**
 * Helper utilities for translating filter options
 */

/**
 * Translates an array of filter options by mapping each option's label through a translation function
 * @param options - Array of filter options with id and label
 * @param t - Translation function from react-i18next
 * @param keyPrefix - Translation key prefix (e.g., 'filters.apartmentSubtypes')
 * @returns Array of options with translated labels, preserving all other properties including IDs
 */
export function translateFilterOptions<T extends { id: string; label: string }>(
  options: T[],
  t: (key: string) => string,
  keyPrefix: string
): T[] {
  return options.map(option => ({
    ...option,
    label: t(`${keyPrefix}.${option.id}`, option.label) // Use original label as fallback
  }));
}
