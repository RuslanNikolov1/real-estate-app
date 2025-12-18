import * as z from 'zod';

/**
 * Zod schema for property creation validation
 * All numeric fields are coerced from strings
 */
export const createPropertySchema = z.object({
  // Основна информация
  sale_or_rent: z.enum(['sale', 'rent']),
  type: z.enum([
    'apartment',
    'house',
    'villa',
    'office',
    'shop',
    'warehouse',
    'land',
    'hotel',
    'agricultural',
    'garage',
    'restaurant',
    'replace-real-estates',
    'buy-real-estates',
    'other-real-estates',
  ]),
  subtype: z.string().optional(),

  // Основни стойности
  area_sqm: z.coerce.number().positive('Площта трябва да е положително число'),
  price: z.coerce.number().min(0, 'Цената не може да е отрицателна'),
  price_per_sqm: z.coerce.number().min(0, 'Цената на м² трябва да е положително число'),
  floor: z.enum(['basement', 'ground', 'first-residential', 'not-last', 'last', 'attic']).optional(),
  total_floors: z.coerce.number().int().optional(),
  yard_area: z.coerce.number().optional(),

  // Локация
  city: z.string().min(1, 'Градът е задължителен'),
  // Neighborhood is optional – can be empty or omitted
  neighborhood: z.string().optional(),

  // Описание
  title: z.string().min(1, 'Заглавието е задължително'),
  description: z.string().min(1, 'Описанието е задължително'),

  // Параметри
  build_year: z.coerce.number().int().optional(),
  construction_type: z.string().optional(),
  completion_degree: z.string().optional(),
  building_type: z.string().optional(),
  electricity: z.string().optional(),
  water: z.string().optional(),

  // Особености
  features: z.array(z.string()).optional().default([]),

  // Брокер
  broker_name: z.string().min(1, 'Името на брокера е задължително'),
  broker_position: z.string().min(1, 'Длъжността е задължителна'),
  broker_phone: z.string()
    .min(1, 'Телефонът на брокера е задължителен')
    .refine(
      (phone) => {
        if (!phone || !phone.trim()) return false;
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

  // Images - handled separately in API route (File objects)
  images: z.any().refine(
    (val) => Array.isArray(val) && val.length > 0,
    { message: 'Поне едно изображение е задължително' }
  ),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

