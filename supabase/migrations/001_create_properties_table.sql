-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  short_id bigint generated always as identity unique,

  -- posting/meta
  title text not null default '',           -- Merged from 002/004
  description text not null default '',     -- Merged from 004
  date_posted timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- commercial status
  sale_or_rent text not null check (sale_or_rent in ('sale','rent')),
  status text not null default 'for-sale' check (status in ('for-sale','for-rent','sold','rented')),

  -- basic categorisation
  type text not null,
  subtype text,
  city text not null,
  
  -- SPELLING FIX: Changed from 'neighbourhood' to 'neighborhood'
  neighborhood text,

  -- pricing + size
  price numeric(12,2) not null,
  price_per_sqm numeric(12,2),
  area_sqm numeric(12,2) not null,
  yard_area_sqm numeric(12,2),
  
  floor text,
  total_floors text,
  
  -- construction & completion
  build_year integer,                       -- Merged from 004
  construction_type text,
  completion_degree text,                   -- Merged from 004

  -- land / infrastructure extras
  electricity text,
  water text,

  -- hotel/agricultural/garage specifics
  hotel_category text,
  bed_base integer,
  agricultural_category text,

  -- general feature buckets
  features text[],
  
  -- Image array columns
  image_urls text[] default '{}'::text[] not null,
  image_public_ids text[] default '{}'::text[] not null,

  -- broker info
  broker_image text,
  broker_name text,
  broker_phone text,
  broker_position text                      -- Merged from 003/004
);

-- Triggers for updated_at
create or replace function public.set_properties_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;

create trigger properties_set_updated_at
before update on public.properties
for each row execute procedure public.set_properties_updated_at();

-- Enable Row Level Security
alter table public.properties enable row level security;

-- Create indexes for common queries
create index on public.properties (city);
create index on public.properties (type);
create index on public.properties (created_at desc);
create index on public.properties (status);

-- RLS Policies
create policy "Public can view properties"
  on public.properties
  for select
  using (true);





