-- Migration: Add building_type column to properties table
-- Stores the building type (\"Вид сграда\") for commercial properties (offices, shops, restaurants, etc.)

alter table public.properties
  add column if not exists building_type text;


