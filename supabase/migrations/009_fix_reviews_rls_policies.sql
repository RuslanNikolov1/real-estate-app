-- Fix RLS policies for reviews table
-- The original policies tried to query auth.users directly, which the anon role cannot access
-- This migration creates a security definer function and updates the policies to use it

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

-- Drop existing admin policies that query auth.users directly
drop policy if exists "Admin can update reviews" on public.reviews;
drop policy if exists "Admin can delete reviews" on public.reviews;
drop policy if exists "Admin can view all reviews" on public.reviews;

-- Recreate admin policies using the security definer function
create policy "Admin can update reviews"
  on public.reviews for update
  using (public.is_admin_user(auth.uid()));

create policy "Admin can delete reviews"
  on public.reviews for delete
  using (public.is_admin_user(auth.uid()));

create policy "Admin can view all reviews"
  on public.reviews for select
  using (public.is_admin_user(auth.uid()));
