-- Migration: Make area_sqm nullable for rent hotels
-- For rent hotels, area_sqm is not applicable, so it should be nullable
-- For sale hotels and other property types, area_sqm is still required (enforced by application logic)

alter table public.properties
  alter column area_sqm drop not null;
