-- Migration: Add works column to properties table
-- Stores working schedule for hotels/resorts in rent mode
-- Values: 'seasonal' - Работи сезонно (Works seasonally)
--        'year-round' - Работи целогодишно (Works all year round)

alter table public.properties
  add column if not exists works text
  check (works in ('seasonal', 'year-round'));
