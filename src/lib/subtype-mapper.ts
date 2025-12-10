/**
 * Valid English IDs for apartment subtypes
 * This is used to validate if a value is already an English ID
 */
const VALID_APARTMENT_SUBTYPE_IDS = [
  'studio',
  'one-bedroom',
  'two-bedroom',
  'multi-bedroom',
  'maisonette',
  'atelier',
  'attic',
] as const;

/**
 * Maps apartment subtype labels (Bulgarian) to IDs (English)
 * This handles the case where admin forms may save labels instead of IDs
 */
const SUBTYPE_LABEL_TO_ID_MAP: Record<string, string> = {
  // Bulgarian labels to IDs
  'Едностаен': 'studio',
  'Двустаен': 'one-bedroom',
  'Тристаен': 'two-bedroom',
  'Многостаен': 'multi-bedroom',
  'Мезонет': 'maisonette',
  'Ателие/Студио': 'atelier',
  'Таван': 'attic',
  // Also include IDs as-is (in case they're already IDs)
  'studio': 'studio',
  'one-bedroom': 'one-bedroom',
  'two-bedroom': 'two-bedroom',
  'multi-bedroom': 'multi-bedroom',
  'maisonette': 'maisonette',
  'atelier': 'atelier',
  'attic': 'attic',
};

/**
 * Maps English IDs to Bulgarian labels
 * Used for backward compatibility when searching database
 */
const SUBTYPE_ID_TO_LABEL_MAP: Record<string, string> = {
  'studio': 'Едностаен',
  'one-bedroom': 'Двустаен',
  'two-bedroom': 'Тристаен',
  'multi-bedroom': 'Многостаен',
  'maisonette': 'Мезонет',
  'atelier': 'Ателие/Студио',
  'attic': 'Таван',
};

/**
 * Converts subtype value (could be ID or Bulgarian label) to standardized English ID
 * Always returns English IDs like 'studio', 'one-bedroom', 'two-bedroom', etc.
 * 
 * LANGUAGE-AGNOSTIC: This function ensures database consistency regardless of UI language.
 * - Filter components always send English IDs
 * - Admin forms send English IDs (from option.id)
 * - This function normalizes any Bulgarian labels (from old data) to English IDs
 * - Database always stores English IDs for consistency
 * 
 * @param subtype - Subtype value from database or filter (could be ID or Bulgarian label)
 * @returns Normalized subtype ID in English (e.g., 'studio', 'one-bedroom') or null
 * 
 * @example
 * normalizeSubtypeToId('Едностаен') // returns 'studio'
 * normalizeSubtypeToId('studio') // returns 'studio'
 * normalizeSubtypeToId('Двустаен') // returns 'one-bedroom'
 */
export function normalizeSubtypeToId(subtype: string | null | undefined): string | null {
  if (!subtype) return null;
  
  // Check if it's already a valid English ID
  const isValidId = VALID_APARTMENT_SUBTYPE_IDS.includes(subtype as any);
  if (isValidId) {
    return subtype; // Already an English ID, return as-is
  }
  
  // Map Bulgarian label to English ID
  const mappedId = SUBTYPE_LABEL_TO_ID_MAP[subtype];
  if (mappedId) {
    return mappedId; // Return the English ID
  }
  
  // If no mapping found, return as-is (shouldn't happen in normal flow, but handles edge cases)
  // In production, this should ideally log a warning
  console.warn(`Unknown subtype value: "${subtype}". Expected English ID or Bulgarian label.`);
  return subtype;
}

/**
 * Converts an array of subtype values (IDs or labels) to normalized IDs
 * @param subtypes - Array of subtype values (could be IDs or labels)
 * @returns Array of normalized subtype IDs
 */
export function normalizeSubtypesToIds(subtypes: string[]): string[] {
  return subtypes
    .map(subtype => normalizeSubtypeToId(subtype))
    .filter((id): id is string => id !== null && id !== 'all');
}

/**
 * Gets all possible values (both IDs and labels) for a given normalized ID
 * This is useful for database queries where we need to match both IDs and labels
 * 
 * LANGUAGE-AGNOSTIC: Always receives English IDs, returns both English ID and Bulgarian label
 * for backward compatibility with old database entries that might have Bulgarian labels
 * 
 * @param normalizedId - Normalized subtype ID in English (e.g., 'one-bedroom')
 * @returns Array of possible values that should match in database (English ID + Bulgarian label if exists)
 */
export function getSubtypeSearchValues(normalizedId: string): string[] {
  const values = [normalizedId]; // Always include the ID itself
  
  // Add Bulgarian label if it exists (for backward compatibility)
  const bulgarianLabel = SUBTYPE_ID_TO_LABEL_MAP[normalizedId];
  if (bulgarianLabel) {
    values.push(bulgarianLabel);
  }
  
  return values;
}


