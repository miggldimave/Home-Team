-- Fix: explicitly enable RLS on households (was missing despite policies existing)
alter table public.households enable row level security;
