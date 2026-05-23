-- Fix: series_status_check does not allow 'active'
-- Run in Supabase Dashboard → SQL Editor

alter table public.series drop constraint if exists series_status_check;

alter table public.series add constraint series_status_check
  check (status in ('active', 'scheduled', 'generating', 'published', 'failed', 'cancelled'));

alter table public.series alter column status set default 'active';

update public.series set status = 'active' where status = 'scheduled';
