-- Migration: Add furniture column to properties table
-- Stores furnishing level for a property using three discrete values:
-- 'full'    - fully furnished
-- 'partial' - partially furnished
-- 'none'    - no furniture

alter table public.properties
  add column if not exists furniture text
  check (furniture in ('full', 'partial', 'none'));



