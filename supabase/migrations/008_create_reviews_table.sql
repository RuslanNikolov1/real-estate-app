-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text not null,
  user_email text not null,
  comment text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Security definer function to check if user is admin
-- This function runs with elevated privileges and can access auth.users
create or replace function public.is_admin_user(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from auth.users
    where id = user_id
      and email = 'ruslannikolov1@gmail.com'
  );
end;
$$;

-- Grant execute permission to anon and authenticated roles
grant execute on function public.is_admin_user(uuid) to anon, authenticated;

-- Anyone can read approved reviews
create policy "Anyone can view approved reviews"
  on public.reviews for select
  using (is_approved = true);

-- Authenticated users can insert their own reviews
create policy "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Only admin can update reviews (approve/reject)
create policy "Admin can update reviews"
  on public.reviews for update
  using (public.is_admin_user(auth.uid()));

-- Only admin can delete reviews
create policy "Admin can delete reviews"
  on public.reviews for delete
  using (public.is_admin_user(auth.uid()));

-- Admin can view all reviews (approved and pending)
create policy "Admin can view all reviews"
  on public.reviews for select
  using (public.is_admin_user(auth.uid()));

-- Trigger for updated_at
create or replace function public.set_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute procedure public.set_reviews_updated_at();

-- Create index for faster queries
create index if not exists reviews_approved_idx on public.reviews(is_approved);
create index if not exists reviews_created_at_idx on public.reviews(created_at desc);
