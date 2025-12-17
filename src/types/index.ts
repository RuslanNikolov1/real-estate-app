// Property types
export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'office'
  | 'shop'
  | 'warehouse'
  | 'land'
  | 'hotel'
  | 'agricultural'
  | 'garage'
  | 'restaurant'
  | 'replace-real-estates'
  | 'buy-real-estates'
  | 'other-real-estates';

// PropertyStatus is kept for backward compatibility but is now derived from sale_or_rent
// sale_or_rent: 'sale' -> status: 'for-sale'
// sale_or_rent: 'rent' -> status: 'for-rent'
export type PropertyStatus = 'for-sale' | 'for-rent';

export type LocationType = 'urban' | 'mountain' | 'coastal';

export interface PropertyImage {
  id: string;
  url: string;
  public_id: string;
  width: number;
  height: number;
  alt?: string;
  is_primary?: boolean;
}

export type FurnishingLevel = 'unfurnished' | 'semi-furnished' | 'furnished' | 'luxury';
export type HeatingType = 'central' | 'electric' | 'gas' | 'wood' | 'none';

export interface Property {
  id: string;
  short_id?: number;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  city: string;
  neighborhood?: string;
  price: number;
  currency: string;
  area: number;
  rooms?: number;
  bathrooms?: number;
  subtype?: string;
  floor?: string;
  total_floors?: number;
  year_built?: number;
  yard_area_sqm?: number;
  images: PropertyImage[];
  features?: string[];
  construction_type?: string;
  completion_degree?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  view_count: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
  // Допълнителни детайли
  furnishing_level?: FurnishingLevel;
  heating?: HeatingType;
  has_elevator?: boolean;
  has_condominium?: boolean;
  has_wiring?: boolean;
  has_access_control?: boolean;
  has_garage?: boolean;
  is_luxury?: boolean;
  has_air_conditioning?: boolean;
  has_video_surveillance?: boolean;
  is_renovated?: boolean;
  nearby_amenities?: string[];
  floor_plan_url?: string;
  video_url?: string;
  price_history?: Array<{
    date: string;
    price: number;
  }>;
  broker_name?: string;
  broker_phone?: string;
  broker_position?: string;
  broker_image?: string;
}

export interface PropertySearchFilters {
  type?: PropertyType[];
  status?: PropertyStatus[];
  city?: string;
  neighborhoods?: string[];
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  rooms?: number;
  bathrooms?: number;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: PropertySearchFilters;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Review types
export interface Review {
  id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  property_id?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Certificate and Membership types
export interface Certificate {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  public_id: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Neighborhood types
export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  description: string;
  images: PropertyImage[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  properties_count?: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'broker';
  created_at: string;
}

// Partner Service types
export interface PartnerService {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

