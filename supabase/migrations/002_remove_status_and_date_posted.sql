-- Migration: Remove status and date_posted columns from properties table
-- This migration drops the status and date_posted columns as they are redundant
-- status is replaced by sale_or_rent (which already exists)
-- date_posted is replaced by created_at (which already exists)

-- Drop the index on status column first
drop index if exists public.properties_status_idx;

-- Drop the status column
alter table public.properties drop column if exists status;

-- Drop the date_posted column
alter table public.properties drop column if exists date_posted;








