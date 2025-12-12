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
  price_per_sqm: z.coerce.number().optional(),
  floor: z.coerce.number().int().optional(),
  total_floors: z.coerce.number().int().optional(),
  yard_area: z.coerce.number().optional(),

  // Локация
  city: z.string().min(1, 'Градът е задължителен'),
  neighborhood: z.string().min(1, 'Кварталът е задължителен'),

  // Описание
  title: z.string().min(1, 'Заглавието е задължително'),
  description: z.string().min(1, 'Описанието е задължително'),

  // Параметри
  build_year: z.coerce.number().int().optional(),
  construction_type: z.string().optional(),
  completion_degree: z.string().optional(),

  // Особености
  features: z.array(z.string()).optional().default([]),

  // Брокер
  broker_name: z.string().min(1, 'Името на брокера е задължително'),
  broker_position: z.string().min(1, 'Длъжността е задължителна'),
  broker_phone: z.string().min(1, 'Телефонът на брокера е задължителен'),

  // Images - handled separately in API route (File objects)
  images: z.any().refine(
    (val) => Array.isArray(val) && val.length > 0,
    { message: 'Поне едно изображение е задължително' }
  ),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

