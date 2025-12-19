/**
 * Utility functions for mapping property types between filter page IDs and add page IDs
 */

// Rent property type IDs from filter page
export const RENT_PROPERTY_TYPE_IDS = [
  'apartments',
  'houses-villas',
  'restaurants',
  'stores-offices',
  'garages-parking',
  'warehouses-industrial',
  'building-plots',
  'hotels-motels'
] as const;

/**
 * Maps filter page property type IDs to add page property type IDs
 * Filter page uses plural/combined IDs (e.g., 'apartments', 'houses-villas')
 * Add page uses singular IDs (e.g., 'apartment', 'house')
 */
export function mapFilterTypeToAddPageType(filterTypeId: string): string[] {
  const mapping: Record<string, string[]> = {
    'apartments': ['apartment'],
    'houses-villas': ['house'],
    'restaurants': ['restaurant'],
    'stores-offices': ['office', 'shop'],
    'garages-parking': ['garage'],
    'warehouses-industrial': ['warehouse'],
    'building-plots': ['land'],
    'hotels-motels': ['hotel'],
  };

  return mapping[filterTypeId] || [];
}

/**
 * Returns rent property type IDs from filter page
 */
export function getRentPropertyTypes(): readonly string[] {
  return RENT_PROPERTY_TYPE_IDS;
}

/**
 * Property type options for the add page
 */
export interface AddPagePropertyType {
  id: string;
  label: string;
}

/**
 * All available property types for sale (add page format)
 */
export const SALE_PROPERTY_TYPES: AddPagePropertyType[] = [
  { id: 'apartment', label: 'Апартамент' },
  { id: 'house', label: 'Къща/Вила' },
  { id: 'office', label: 'Офис' },
  { id: 'shop', label: 'Магазин' },
  { id: 'warehouse', label: 'Склад' },
  { id: 'land', label: 'Парцел' },
  { id: 'hotel', label: 'Хотел' },
  { id: 'agricultural', label: 'Земеделска земя' },
  { id: 'garage', label: 'Гараж/Паркоместа' },
  { id: 'restaurant', label: 'Ресторант' },
  { id: 'replace-real-estates', label: 'Замяна на недвижими имоти' },
  { id: 'buy-real-estates', label: 'Купуване на недвижими имоти' },
  { id: 'other-real-estates', label: 'Други недвижими имоти' },
];

/**
 * Property types available for rent (add page format)
 * Based on the rent property types from the filter page
 * Labels match the rent filter page labels
 */
export const RENT_PROPERTY_TYPES: AddPagePropertyType[] = [
  { id: 'apartment', label: 'Апартаменти' },
  { id: 'house', label: 'Къщи' },
  { id: 'office', label: 'Магазини/Офиси/Кабинети/Салони' },
  { id: 'land', label: 'Парцели/Терени' },
  { id: 'warehouse', label: 'Складове/Промишлени и стопански имоти под наем' },
  { id: 'garage', label: 'Гаражи/Паркинги/Паркоместа под наем' },
  { id: 'hotel', label: 'Хотели/Почивни станции' },
  { id: 'restaurant', label: 'Заведения' },
];

/**
 * Returns available property types for the add page based on sale/rent status
 */
export function getAvailablePropertyTypesForAddPage(isRent: boolean): AddPagePropertyType[] {
  return isRent ? RENT_PROPERTY_TYPES : SALE_PROPERTY_TYPES;
}

