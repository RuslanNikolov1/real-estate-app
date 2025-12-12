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
 * Maps apartment subtype labels (all languages) to IDs (English)
 * This handles the case where admin forms or database may save labels instead of IDs
 * Supports: Bulgarian, Russian, English, German
 */
const SUBTYPE_LABEL_TO_ID_MAP: Record<string, string> = {
  // Bulgarian labels to IDs
  'Едностаен': 'studio',
  'Двустаен': 'one-bedroom',
  'Тристаен': 'two-bedroom',
  'Многостаен': 'multi-bedroom',
  'Мезонет': 'maisonette',
  'Ателие/Студио': 'atelier',
  'Ателие': 'atelier',
  'Студио': 'atelier',
  'Таван': 'attic',
  
  // Russian labels to IDs
  'Однокомнатная': 'studio',
  'Однокомнатная квартира': 'studio',
  'Студия': 'studio',
  'Двухкомнатная': 'one-bedroom',
  'Двухкомнатная квартира': 'one-bedroom',
  'Трехкомнатная': 'two-bedroom',
  'Трехкомнатная квартира': 'two-bedroom',
  'Многокомнатная': 'multi-bedroom',
  'Многокомнатная квартира': 'multi-bedroom',
  'Ателье': 'atelier',
  'Студия/Ателье': 'atelier',
  'Мансарда': 'attic',
  'Чердак': 'attic',
  
  // English labels to IDs (case-insensitive handling)
  'Studio': 'studio',
  'studio': 'studio',
  'One Bedroom': 'one-bedroom',
  'one-bedroom': 'one-bedroom',
  'one bedroom': 'one-bedroom',
  '1-bedroom': 'one-bedroom',
  '1 bedroom': 'one-bedroom',
  'Two Bedroom': 'two-bedroom',
  'two-bedroom': 'two-bedroom',
  'two bedroom': 'two-bedroom',
  '2-bedroom': 'two-bedroom',
  '2 bedroom': 'two-bedroom',
  'Multi Bedroom': 'multi-bedroom',
  'multi-bedroom': 'multi-bedroom',
  'multi bedroom': 'multi-bedroom',
  'Maisonette': 'maisonette',
  'maisonette': 'maisonette',
  'Atelier': 'atelier',
  'atelier': 'atelier',
  'Attic': 'attic',
  'attic': 'attic',
  
  // German labels to IDs
  'Einzimmerwohnung': 'studio',
  'Zweizimmerwohnung': 'one-bedroom',
  '2-Zimmer-Wohnung': 'one-bedroom',
  'Dreizimmerwohnung': 'two-bedroom',
  '3-Zimmer-Wohnung': 'two-bedroom',
  'Mehrzimmerwohnung': 'multi-bedroom',
  'Dachgeschoss': 'attic',
  'Dachwohnung': 'attic',
  
  // Common variations and aliases
  '1-room': 'studio',
  '1 room': 'studio',
  '2-room': 'one-bedroom',
  '2 room': 'one-bedroom',
  '3-room': 'two-bedroom',
  '3 room': 'two-bedroom',
  '4+ room': 'multi-bedroom',
  '4+room': 'multi-bedroom',
  
  // Common typos (for backward compatibility with existing database entries)
  'one-bedrrom': 'one-bedroom', // typo: double 'r'
  'one-bedrom': 'one-bedroom', // typo: missing 'o'
  'one-bedromm': 'one-bedroom', // typo: double 'm'
  'mult-bedroom': 'multi-bedroom', // typo: missing 'i'
  'multi-bedrom': 'multi-bedroom', // typo: missing 'o'
  'multi-bedrrom': 'multi-bedroom', // typo: double 'r'
};

/**
 * Maps English IDs to labels in all supported languages
 * Used for displaying subtypes in the UI based on current language
 */
const SUBTYPE_ID_TO_LABEL_MAP: Record<string, Record<string, string>> = {
  // Apartment subtypes
  'studio': {
    'bg': 'Едностаен',
    'en': 'Studio',
    'ru': 'Студия',
    'de': 'Einzimmerwohnung',
  },
  'one-bedroom': {
    'bg': 'Двустаен',
    'en': 'One Bedroom',
    'ru': 'Двухкомнатная',
    'de': 'Zweizimmerwohnung',
  },
  'two-bedroom': {
    'bg': 'Тристаен',
    'en': 'Two Bedroom',
    'ru': 'Трехкомнатная',
    'de': 'Dreizimmerwohnung',
  },
  'multi-bedroom': {
    'bg': 'Многостаен',
    'en': 'Multi Bedroom',
    'ru': 'Многокомнатная',
    'de': 'Mehrzimmerwohnung',
  },
  'maisonette': {
    'bg': 'Мезонет',
    'en': 'Maisonette',
    'ru': 'Мезонет',
    'de': 'Maisonette',
  },
  'atelier': {
    'bg': 'Ателие/Студио',
    'en': 'Atelier',
    'ru': 'Ателье',
    'de': 'Atelier',
  },
  'attic': {
    'bg': 'Таван',
    'en': 'Attic',
    'ru': 'Мансарда',
    'de': 'Dachgeschoss',
  },
  // House/Villa subtypes (floor count)
  'one-floor': {
    'bg': 'Едноетажна',
    'en': 'One Floor',
    'ru': 'Одноэтажный',
    'de': 'Ein Geschoss',
  },
  'two-floor': {
    'bg': 'Двуетажна',
    'en': 'Two Floor',
    'ru': 'Двухэтажный',
    'de': 'Zwei Geschosse',
  },
  'three-floor': {
    'bg': 'Триетажна',
    'en': 'Three Floor',
    'ru': 'Трехэтажный',
    'de': 'Drei Geschosse',
  },
  'four-plus-floor': {
    'bg': 'Четириетажна+',
    'en': 'Four+ Floor',
    'ru': 'Четырехэтажный+',
    'de': 'Vier+ Geschosse',
  },
  'house-floor': {
    'bg': 'Етаж от сграда',
    'en': 'Floor from Building',
    'ru': 'Этаж здания',
    'de': 'Geschoss aus Gebäude',
  },
  'not-specified': {
    'bg': 'Не е посочено',
    'en': 'Not Specified',
    'ru': 'Не указано',
    'de': 'Nicht angegeben',
  },
  // Commercial property types
  'store': {
    'bg': 'Магазин',
    'en': 'Store',
    'ru': 'Магазин',
    'de': 'Geschäft',
  },
  'office': {
    'bg': 'Офис',
    'en': 'Office',
    'ru': 'Офис',
    'de': 'Büro',
  },
  'cabinet': {
    'bg': 'Кабинет',
    'en': 'Cabinet',
    'ru': 'Кабинет',
    'de': 'Praxis',
  },
  'beauty-salon': {
    'bg': 'Салон за красота',
    'en': 'Beauty Salon',
    'ru': 'Салон красоты',
    'de': 'Schönheitssalon',
  },
  'sport': {
    'bg': 'Спорт',
    'en': 'Sport',
    'ru': 'Спорт',
    'de': 'Sport',
  },
  'other': {
    'bg': 'Друго',
    'en': 'Other',
    'ru': 'Другое',
    'de': 'Andere',
  },
  // Hotel/Motel types
  'hotel': {
    'bg': 'Хотел',
    'en': 'Hotel',
    'ru': 'Отель',
    'de': 'Hotel',
  },
  'family-hotel': {
    'bg': 'Семеен хотел',
    'en': 'Family Hotel',
    'ru': 'Семейный отель',
    'de': 'Familienhotel',
  },
  'resort': {
    'bg': 'Почивна станция',
    'en': 'Resort',
    'ru': 'Курорт',
    'de': 'Resort',
  },
  'hostel-pension': {
    'bg': 'Хостел/Пансион',
    'en': 'Hostel/Pension',
    'ru': 'Хостел/Пансион',
    'de': 'Hostel/Pension',
  },
  'motel': {
    'bg': 'Мотели',
    'en': 'Motel',
    'ru': 'Мотель',
    'de': 'Motel',
  },
  'lodge': {
    'bg': 'Хижа',
    'en': 'Lodge',
    'ru': 'Хижина',
    'de': 'Hütte',
  },
  'unspecified': {
    'bg': 'Не е посочено',
    'en': 'Unspecified',
    'ru': 'Не указано',
    'de': 'Nicht angegeben',
  },
  // Warehouse/Industrial types
  'warehouse': {
    'bg': 'Склад',
    'en': 'Warehouse',
    'ru': 'Склад',
    'de': 'Lager',
  },
  'industrial-premise': {
    'bg': 'Промишлено помещение',
    'en': 'Industrial Premise',
    'ru': 'Промышленное помещение',
    'de': 'Industriegebäude',
  },
  'farm': {
    'bg': 'Ферма',
    'en': 'Farm',
    'ru': 'Ферма',
    'de': 'Bauernhof',
  },
  'factory': {
    'bg': 'Фабрика',
    'en': 'Factory',
    'ru': 'Фабрика',
    'de': 'Fabrik',
  },
  'service': {
    'bg': 'Сервиз',
    'en': 'Service',
    'ru': 'Сервис',
    'de': 'Service',
  },
  'car-wash': {
    'bg': 'Автомивка',
    'en': 'Car Wash',
    'ru': 'Автомойка',
    'de': 'Autowäsche',
  },
  'gas-station': {
    'bg': 'Бензиностанция',
    'en': 'Gas Station',
    'ru': 'Заправка',
    'de': 'Tankstelle',
  },
  'hall': {
    'bg': 'Зала',
    'en': 'Hall',
    'ru': 'Зал',
    'de': 'Halle',
  },
  // Garage types
  'garage-standalone': {
    'bg': 'Гараж (самостоятелен)',
    'en': 'Garage (Standalone)',
    'ru': 'Гараж (отдельный)',
    'de': 'Garage (Eigenständig)',
  },
  'parking-space': {
    'bg': 'Паркомясто',
    'en': 'Parking Space',
    'ru': 'Парковочное место',
    'de': 'Parkplatz',
  },
  'whole-parking': {
    'bg': 'Цял паркинг',
    'en': 'Whole Parking',
    'ru': 'Весь паркинг',
    'de': 'Ganzer Parkplatz',
  },
  // Agricultural types
  'forest': {
    'bg': 'Гора',
    'en': 'Forest',
    'ru': 'Лес',
    'de': 'Wald',
  },
  'agricultural-land': {
    'bg': 'Земеделска земя',
    'en': 'Agricultural Land',
    'ru': 'Сельскохозяйственная земля',
    'de': 'Landwirtschaftliche Fläche',
  },
  'vineyard': {
    'bg': 'Лозе',
    'en': 'Vineyard',
    'ru': 'Виноградник',
    'de': 'Weinberg',
  },
  'fruit-garden': {
    'bg': 'Овощна градина',
    'en': 'Fruit Garden',
    'ru': 'Фруктовый сад',
    'de': 'Obstgarten',
  },
  'pasture': {
    'bg': 'Пасище',
    'en': 'Pasture',
    'ru': 'Пастбище',
    'de': 'Weide',
  },
};

/**
 * Converts subtype value (could be ID or label in any language) to standardized English ID
 * Always returns English IDs like 'studio', 'one-bedroom', 'two-bedroom', etc.
 * 
 * LANGUAGE-AGNOSTIC: This function ensures database consistency regardless of UI language.
 * - Filter components always send English IDs
 * - Admin forms send English IDs (from option.id)
 * - This function normalizes any labels (Bulgarian, Russian, English, German) to English IDs
 * - Database always stores English IDs for consistency
 * 
 * @param subtype - Subtype value from database or filter (could be ID or label in any language)
 * @returns Normalized subtype ID in English (e.g., 'studio', 'one-bedroom') or null
 * 
 * @example
 * normalizeSubtypeToId('Едностаен') // returns 'studio' (Bulgarian)
 * normalizeSubtypeToId('Однокомнатная') // returns 'studio' (Russian)
 * normalizeSubtypeToId('studio') // returns 'studio' (English ID)
 * normalizeSubtypeToId('Двустаен') // returns 'one-bedroom' (Bulgarian)
 */
export function normalizeSubtypeToId(subtype: string | null | undefined): string | null {
  if (!subtype) return null;
  
  // Trim whitespace and normalize
  const normalizedInput = subtype.trim();
  
  // Check if it's already a valid English ID (case-insensitive)
  const lowerInput = normalizedInput.toLowerCase();
  const isValidId = VALID_APARTMENT_SUBTYPE_IDS.some(id => id.toLowerCase() === lowerInput);
  if (isValidId) {
    // Return the canonical English ID (preserve original casing format)
    return VALID_APARTMENT_SUBTYPE_IDS.find(id => id.toLowerCase() === lowerInput) || normalizedInput;
  }
  
  // Try exact match first (case-sensitive for proper language detection)
  const exactMatch = SUBTYPE_LABEL_TO_ID_MAP[normalizedInput];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Try case-insensitive match for English labels
  const caseInsensitiveMatch = Object.entries(SUBTYPE_LABEL_TO_ID_MAP).find(
    ([key]) => key.toLowerCase() === lowerInput
  );
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch[1];
  }
  
  // If no mapping found, log warning and return null
  // This ensures we don't save invalid subtypes to the database
  console.warn(
    `Unknown subtype value: "${subtype}". Expected English ID or label in Bulgarian/Russian/English/German. ` +
    `Valid IDs: ${VALID_APARTMENT_SUBTYPE_IDS.join(', ')}`
  );
  return null;
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
 * Also includes common typo variants to handle existing database entries with typos
 * 
 * @param normalizedId - Normalized subtype ID in English (e.g., 'one-bedroom')
 * @returns Array of possible values that should match in database (English ID + Bulgarian label + typo variants)
 */
export function getSubtypeSearchValues(normalizedId: string): string[] {
  const values = new Set<string>();
  
  // Always include the normalized ID itself
  values.add(normalizedId);
  
  // Add Bulgarian label if it exists (for backward compatibility)
  const labelMap = SUBTYPE_ID_TO_LABEL_MAP[normalizedId];
  if (labelMap && labelMap['bg']) {
    values.add(labelMap['bg']);
  }
  
  // Add common typo variants for backward compatibility with existing database entries
  // This handles cases where properties were saved with typos before normalization was implemented
  const typoVariants: Record<string, string[]> = {
    'one-bedroom': ['one-bedrrom', 'one-bedrom', 'one-bedromm'], // common typos
    'multi-bedroom': ['mult-bedroom', 'multi-bedrom', 'multi-bedrrom'], // common typos
    'two-bedroom': ['two-bedrom', 'two-bedrrom'], // common typos
    'studio': ['studyo', 'studdio'], // common typos
  };
  
  const typos = typoVariants[normalizedId];
  if (typos) {
    typos.forEach(typo => values.add(typo));
  }
  
  return Array.from(values);
}

/**
 * Converts an English subtype ID to a label in the specified language
 * Used for displaying subtypes in the UI based on current language
 * 
 * @param subtypeId - English subtype ID (e.g., 'studio', 'one-bedroom')
 * @param language - Language code ('bg', 'en', 'ru', 'de')
 * @returns Translated label or the original ID if translation not found
 * 
 * @example
 * getSubtypeLabel('studio', 'bg') // returns 'Едностаен'
 * getSubtypeLabel('one-bedroom', 'ru') // returns 'Двухкомнатная'
 * getSubtypeLabel('two-bedroom', 'en') // returns 'Two Bedroom'
 */
export function getSubtypeLabel(subtypeId: string | null | undefined, language: string = 'bg'): string {
  if (!subtypeId) return '';
  
  // Normalize language code (handle 'en-US' -> 'en')
  const lang = language.split('-')[0].toLowerCase();
  
  // Get label map for this subtype
  const labelMap = SUBTYPE_ID_TO_LABEL_MAP[subtypeId];
  if (labelMap && labelMap[lang]) {
    return labelMap[lang];
  }
  
  // Fallback to Bulgarian if language not found
  if (labelMap && labelMap['bg']) {
    return labelMap['bg'];
  }
  
  // If no translation found, return the ID itself
  return subtypeId;
}




