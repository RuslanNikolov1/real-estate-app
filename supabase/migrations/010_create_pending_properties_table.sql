-- Create pending_properties table
-- This table stores properties submitted by public users for admin review
-- Schema mirrors the properties table

create table if not exists public.pending_properties (
  id uuid primary key default gen_random_uuid(),
  short_id bigint generated always as identity unique,

  -- posting/meta
  title text not null default '',
  description text not null default '',
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
  neighborhood text,

  -- pricing + size
  price numeric(12,2) not null,
  price_per_sqm numeric(12,2),
  area_sqm numeric(12,2), -- nullable (for rent hotels)
  yard_area_sqm numeric(12,2),
  
  floor text,
  total_floors text,
  
  -- construction & completion
  build_year integer,
  construction_type text,
  completion_degree text,

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
  broker_position text,

  -- Additional columns from later migrations
  furniture text check (furniture in ('full', 'partial', 'none')),
  building_type text,
  works text check (works in ('seasonal', 'year-round'))
);

-- Triggers for updated_at
create or replace function public.set_pending_properties_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pending_properties_set_updated_at on public.pending_properties;

create trigger pending_properties_set_updated_at
before update on public.pending_properties
for each row execute procedure public.set_pending_properties_updated_at();

-- Enable Row Level Security
alter table public.pending_properties enable row level security;

-- Create indexes for common queries
create index on public.pending_properties (city);
create index on public.pending_properties (type);
create index on public.pending_properties (created_at desc);
create index on public.pending_properties (status);

-- RLS Policies
-- Public users can insert (submit properties)
create policy "Public can insert pending properties"
  on public.pending_properties
  for insert
  with check (true);

-- Public users can view their own pending properties (if we add user_id later)
-- For now, admins can view all pending properties
-- Admins can view, update, and delete pending properties
-- Note: Admin policies would be set up separately based on your auth system
