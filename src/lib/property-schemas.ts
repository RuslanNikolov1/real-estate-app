import * as z from 'zod';
import type { PropertyType } from '@/types';
import {
  APARTMENT_SUBTYPES,
  HOUSE_TYPES,
  APARTMENT_FEATURE_FILTERS,
  HOUSE_FEATURES,
  CONSTRUCTION_FILTERS,
  COMPLETION_STATUSES,
  COMMERCIAL_PROPERTY_TYPES,
  COMMERCIAL_FEATURES,
  COMMERCIAL_FLOOR_OPTIONS,
  WAREHOUSES_PROPERTY_TYPES,
  WAREHOUSES_FEATURES,
  HOTELS_PROPERTY_TYPES,
  HOTELS_FEATURES,
  HOTEL_CATEGORIES,
  HOTEL_CONSTRUCTION_TYPES,
  GARAGES_PROPERTY_TYPES,
  GARAGES_FEATURES,
  GARAGE_CONSTRUCTION_TYPES,
  BUILDING_PLOTS_FEATURES,
  ELECTRICITY_OPTIONS,
  WATER_OPTIONS,
  AGRICULTURAL_PROPERTY_TYPES,
  AGRICULTURAL_FEATURES,
  AGRICULTURAL_CATEGORIES,
  ESTABLISHMENTS_FEATURES,
  ESTABLISHMENT_CONSTRUCTION_TYPES,
  ESTABLISHMENTS_LOCATION_TYPES,
  BUILDING_TYPES,
  FLOOR_SPECIAL_OPTIONS,
} from '@/features/map-filters/filters/constants';

export type FieldType = 'text' | 'number' | 'select' | 'multi-select' | 'radio' | 'checkbox' | 'textarea';

export interface FieldOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  conditional?: {
    field: string;
    value: any;
  };
}

export interface PropertyTypeSchema {
  subtypeOptions: FieldOption[];
  fields: FieldConfig[];
}

// Helper to filter out 'all' option
const excludeAll = <T extends { id: string }>(items: T[]): T[] =>
  items.filter(item => item.id !== 'all');

// Property type schemas
export const PROPERTY_SCHEMAS: Record<PropertyType, PropertyTypeSchema> = {
  apartment: {
    subtypeOptions: excludeAll(APARTMENT_SUBTYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(APARTMENT_SUBTYPES),
      },
      {
        key: 'floor',
        label: 'Етаж',
        type: 'number',
        required: false,
        placeholder: 'Етаж',
      },
      {
        key: 'total_floors',
        label: 'Общо етажи',
        type: 'number',
        required: false,
        placeholder: 'Общо етажи',
      },
      {
        key: 'construction_type',
        label: 'Тип строителство',
        type: 'select',
        required: false,
        options: CONSTRUCTION_FILTERS.map(f => ({ id: f.id, label: f.label })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(APARTMENT_FEATURE_FILTERS).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  house: {
    subtypeOptions: excludeAll(HOUSE_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(HOUSE_TYPES).map(t => ({ id: t.id, label: t.label })),
      },
      {
        key: 'construction_type',
        label: 'Вид строителство',
        type: 'select',
        required: false,
        options: CONSTRUCTION_FILTERS.map(f => ({ id: f.id, label: f.label })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'yard_area',
        label: 'Площ на двора (м²)',
        type: 'number',
        required: false,
        placeholder: 'Площ на двора',
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(HOUSE_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  villa: {
    subtypeOptions: excludeAll(HOUSE_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(HOUSE_TYPES).map(t => ({ id: t.id, label: t.label })),
      },
      {
        key: 'construction_type',
        label: 'Вид строителство',
        type: 'select',
        required: false,
        options: CONSTRUCTION_FILTERS.map(f => ({ id: f.id, label: f.label })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'yard_area',
        label: 'Площ на двора (м²)',
        type: 'number',
        required: false,
        placeholder: 'Площ на двора',
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(HOUSE_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  office: {
    subtypeOptions: excludeAll(COMMERCIAL_PROPERTY_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(COMMERCIAL_PROPERTY_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'building_type',
        label: 'Вид сграда',
        type: 'select',
        required: false,
        options: BUILDING_TYPES.map(b => ({
          id: b.id,
          label: b.label,
        })),
      },
      {
        key: 'construction_type',
        label: 'Тип строителство',
        type: 'select',
        required: false,
        options: ESTABLISHMENT_CONSTRUCTION_TYPES.map(f => ({
          id: f.id,
          label: f.label,
        })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'floor',
        label: 'Етаж',
        type: 'number',
        required: false,
        placeholder: 'Етаж',
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(COMMERCIAL_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  shop: {
    subtypeOptions: excludeAll(COMMERCIAL_PROPERTY_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(COMMERCIAL_PROPERTY_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'building_type',
        label: 'Вид сграда',
        type: 'select',
        required: false,
        options: BUILDING_TYPES.map(b => ({
          id: b.id,
          label: b.label,
        })),
      },
      {
        key: 'construction_type',
        label: 'Тип строителство',
        type: 'select',
        required: false,
        options: ESTABLISHMENT_CONSTRUCTION_TYPES.map(f => ({
          id: f.id,
          label: f.label,
        })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'floor',
        label: 'Етаж',
        type: 'number',
        required: false,
        placeholder: 'Етаж',
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(COMMERCIAL_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  warehouse: {
    subtypeOptions: excludeAll(WAREHOUSES_PROPERTY_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(WAREHOUSES_PROPERTY_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(WAREHOUSES_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  land: {
    subtypeOptions: [],
    fields: [
      {
        key: 'electricity',
        label: 'Ток',
        type: 'select',
        required: false,
        options: ELECTRICITY_OPTIONS.filter(e => e.id !== 'all').map(e => ({
          id: e.id,
          label: e.label,
        })),
      },
      {
        key: 'water',
        label: 'Вода',
        type: 'select',
        required: false,
        options: WATER_OPTIONS.filter(w => w.id !== 'all').map(w => ({
          id: w.id,
          label: w.label,
        })),
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(BUILDING_PLOTS_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  hotel: {
    subtypeOptions: excludeAll(HOTELS_PROPERTY_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Подтип',
        type: 'select',
        required: false,
        options: excludeAll(HOTELS_PROPERTY_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'hotel_category',
        label: 'Категория',
        type: 'select',
        required: false,
        options: HOTEL_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
          id: c.id,
          label: c.label,
        })),
      },
      {
        key: 'construction_type',
        label: 'Тип строителство',
        type: 'select',
        required: false,
        options: HOTEL_CONSTRUCTION_TYPES.filter(c => c.id !== 'all').map(c => ({
          id: c.id,
          label: c.label,
        })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'bed_base',
        label: 'Леглова база',
        type: 'number',
        required: false,
        placeholder: 'Брой легла',
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(HOTELS_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  agricultural: {
    subtypeOptions: excludeAll(AGRICULTURAL_PROPERTY_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Вид',
        type: 'select',
        required: false,
        options: excludeAll(AGRICULTURAL_PROPERTY_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'agricultural_category',
        label: 'Категория',
        type: 'select',
        required: false,
        options: AGRICULTURAL_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
          id: c.id,
          label: c.label,
        })),
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(AGRICULTURAL_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  garage: {
    subtypeOptions: excludeAll(GARAGES_PROPERTY_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Вид',
        type: 'select',
        required: false,
        options: excludeAll(GARAGES_PROPERTY_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'construction_type',
        label: 'Вид конструкция',
        type: 'select',
        required: false,
        options: GARAGE_CONSTRUCTION_TYPES.map(c => ({
          id: c.id,
          label: c.label,
        })),
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(GARAGES_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  restaurant: {
    subtypeOptions: excludeAll(ESTABLISHMENTS_LOCATION_TYPES),
    fields: [
      {
        key: 'subtype',
        label: 'Разположение',
        type: 'select',
        required: false,
        options: excludeAll(ESTABLISHMENTS_LOCATION_TYPES).map(t => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
        })),
      },
      {
        key: 'building_type',
        label: 'Вид сграда',
        type: 'select',
        required: false,
        options: BUILDING_TYPES.map(b => ({
          id: b.id,
          label: b.label,
        })),
      },
      {
        key: 'construction_type',
        label: 'Тип строителство',
        type: 'select',
        required: false,
        options: ESTABLISHMENT_CONSTRUCTION_TYPES.map(f => ({
          id: f.id,
          label: f.label,
        })),
      },
      {
        key: 'completion_status',
        label: 'Степен на завършеност',
        type: 'select',
        required: false,
        options: COMPLETION_STATUSES.map(s => ({ id: s.id, label: s.label })),
      },
      {
        key: 'floor',
        label: 'Етаж',
        type: 'number',
        required: false,
        placeholder: 'Етаж',
      },
      {
        key: 'features',
        label: 'Особености',
        type: 'multi-select',
        required: false,
        options: excludeAll(ESTABLISHMENTS_FEATURES).map(f => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
        })),
      },
    ],
  },
  'replace-real-estates': {
    subtypeOptions: [],
    fields: [
      // Only location filters - no additional fields
    ],
  },
  'buy-real-estates': {
    subtypeOptions: [],
    fields: [
      // Only location filters and price - no additional fields
      // Price is already in base fields
    ],
  },
  'other-real-estates': {
    subtypeOptions: [],
    fields: [
      // Only location filters and price - no additional fields
      // Price is already in base fields
    ],
  },
};

// Base fields that are common to all property types
export const BASE_PROPERTY_FIELDS: FieldConfig[] = [
  {
    key: 'title',
    label: 'Заглавие',
    type: 'text',
    required: true,
    placeholder: 'Въведете заглавие',
  },
  {
    key: 'description',
    label: 'Описание',
    type: 'textarea',
    required: true,
    placeholder: 'Въведете описание',
  },
  {
    key: 'type',
    label: 'Тип имот',
    type: 'select',
    required: true,
    options: [
      { id: 'apartment', label: 'Апартамент' },
      { id: 'house', label: 'Къща' },
      { id: 'villa', label: 'Вила' },
      { id: 'office', label: 'Магазин/Офис/Кабинет/Салон' },
      { id: 'land', label: 'Строителен парцел/Инвестиционен проект' },
      { id: 'warehouse', label: 'Складове/Индустриални и стопански имоти' },
      { id: 'land', label: 'Земеделска земя/Лозя/Гори' },
      { id: 'hotel', label: 'Хотели/Мотели' },
      { id: 'garage', label: 'Гараж/Паркоместа' },
      { id: 'restaurant', label: 'Ресторант' },
      { id: 'replace-real-estates', label: 'Замяна на недвижими имоти' },
      { id: 'buy-real-estates', label: 'Купуване на недвижими имоти' },
    ],
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    required: true,
    options: [
      { id: 'for-sale', label: 'За продажба' },
      { id: 'for-rent', label: 'Под наем' },
    ],
    // Note: This field is kept in the form for UI, but maps to sale_or_rent in the database
    // sale_or_rent: 'sale' for 'for-sale', 'rent' for 'for-rent'
  },
  {
    key: 'price',
    label: 'Цена',
    type: 'number',
    required: true,
    placeholder: 'Цена',
    min: 0,
  },
  {
    key: 'area',
    label: 'Площ (м²)',
    type: 'number',
    required: true,
    placeholder: 'Площ',
    min: 0,
  },
  {
    key: 'price_per_sqm',
    label: 'Цена на м²',
    type: 'number',
    required: false,
    placeholder: 'Автоматично изчислява се',
    min: 0,
  },
  {
    key: 'year_built',
    label: 'Година на строеж',
    type: 'number',
    required: false,
    placeholder: 'Година',
  },
];

/**
 * Get schema for a specific property type
 */
export function getPropertyTypeSchema(type: PropertyType): PropertyTypeSchema {
  return PROPERTY_SCHEMAS[type] || PROPERTY_SCHEMAS.apartment;
}

/**
 * Get all fields for a property type (base + type-specific)
 */
export function getFieldsForPropertyType(type: PropertyType): FieldConfig[] {
  const baseFields = BASE_PROPERTY_FIELDS.filter(
    field => field.key !== 'type' // Type is handled separately
  );
  const typeSchema = getPropertyTypeSchema(type);
  return [...baseFields, ...typeSchema.fields];
}

/**
 * Translate field configs using a translation function
 * This preserves all internal keys/IDs while translating display labels
 */
export function translateFieldConfigs(
  fields: FieldConfig[],
  t: (key: string) => string
): FieldConfig[] {
  return fields.map(field => {
    const translatedField: FieldConfig = {
      ...field,
      label: field.label.startsWith('propertyForm.') 
        ? t(field.label) 
        : field.label, // If already a translation key, translate it
      placeholder: field.placeholder?.startsWith('propertyForm.')
        ? t(field.placeholder)
        : field.placeholder,
      options: field.options?.map(option => ({
        ...option,
        // Keep option.id unchanged (database value), only translate label
        label: option.label.startsWith('propertyForm.')
          ? t(option.label)
          : option.label,
      })),
    };
    return translatedField;
  });
}

/**
 * Generate Zod schema dynamically based on property type
 */
export function generatePropertySchema(type?: PropertyType) {
  const baseSchema = z.object({
    title: z.string().min(1, 'errors.titleRequired'),
    description: z.string().min(1, 'errors.descriptionRequired'),
    type: z.enum(['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel', 'agricultural', 'garage', 'restaurant', 'replace-real-estates', 'buy-real-estates', 'other-real-estates']),
    status: z.enum(['for-sale', 'for-rent']).optional(), // Used in forms, converted to sale_or_rent for API
    location_type: z.enum(['urban', 'mountain', 'coastal']),
    city: z.string().min(1, 'errors.cityRequired'),
    neighborhood: z.string().optional(),
    price: z.number().min(0, 'errors.priceMustBePositive'),
    area: z.number().min(0, 'errors.areaMustBePositive'),
    price_per_sqm: z.number().min(0, 'errors.pricePerSqmInvalid'),
    year_built: z.number().optional(),
    broker_name: z.string().optional(),
    broker_title: z.string().min(1, 'Длъжността е задължителна'),
    broker_phone: z.string()
      .optional()
      .refine(
        (phone) => {
          // If phone is provided, validate it; if empty/undefined, allow it (optional field)
          if (!phone || !phone.trim()) return true;
          // Remove all spaces and dashes for validation
          const cleaned = phone.replace(/[\s-]/g, '');
          // Check +359 format: +359 followed by 9 digits (total 13 chars)
          if (cleaned.startsWith('+359')) {
            return /^\+359[0-9]{9}$/.test(cleaned);
          }
          // Check 0 format: 0 followed by 9 digits (total 10 chars)
          if (cleaned.startsWith('0')) {
            return /^0[0-9]{9}$/.test(cleaned);
          }
          return false;
        },
        { message: 'Телефонът трябва да е в формат +359 XXX XXX XXX или 0XXX XXX XXX' }
      ),
  });

  if (!type) {
    return baseSchema.extend({
      // Common optional fields
      rooms: z.number().optional(),
      floor: z.enum(['basement', 'ground', 'first-residential', 'not-last', 'last', 'attic']).optional(),
      total_floors: z.number().optional(),
      construction_type: z.string().optional(),
      completion_status: z.string().optional(),
      subtype: z.string().optional(),
      features: z.array(z.string()).optional(),
      yard_area: z.number().optional(),
      hotel_category: z.string().optional(),
      agricultural_category: z.string().optional(),
      building_type: z.string().optional(),
      electricity: z.string().optional(),
      water: z.string().optional(),
      bed_base: z.number().optional(),
    });
  }

  const typeSchema = getPropertyTypeSchema(type);
  const extensions: Record<string, z.ZodTypeAny> = {};

  // Add fields based on schema
  typeSchema.fields.forEach(field => {
    // Skip floor field - it's handled separately below
    if (field.key === 'floor') {
      return;
    }
    
    switch (field.type) {
      case 'number':
        if (field.required) {
          extensions[field.key] = z
            .number()
            .min(field.min ?? 0, `errors.fieldMustBePositive:${field.label}`);
        } else {
          extensions[field.key] = z
            .number()
            .min(field.min ?? 0)
            .optional();
        }
        break;
      case 'select':
        if (field.required) {
          extensions[field.key] = z.string().min(1, `errors.fieldRequired:${field.label}`);
        } else {
          extensions[field.key] = z.string().optional();
        }
        break;
      case 'multi-select':
        extensions[field.key] = z.array(z.string()).optional();
        break;
      default:
        if (field.required) {
          extensions[field.key] = z.string().min(1, `errors.fieldRequired:${field.label}`);
        } else {
          extensions[field.key] = z.string().optional();
        }
    }
  });

  // Add common optional fields that might be used
  if (!extensions.rooms && type !== 'warehouse' && type !== 'land') {
    extensions.rooms = z.number().optional();
  }
  // Always override floor field for apartment, office, shop to accept strings (from select dropdown)
  if (type === 'apartment' || type === 'office' || type === 'shop') {
    // Floor is required - must be a string from the enum options
    extensions.floor = z.enum(['basement', 'ground', 'first-residential', 'not-last', 'last', 'attic'], {
      errorMap: () => ({ message: 'errors.floorRequired' })
    });
  }
  if (!extensions.total_floors && type === 'apartment') {
    extensions.total_floors = z.number().optional();
  }

  return baseSchema.extend(extensions);
}

