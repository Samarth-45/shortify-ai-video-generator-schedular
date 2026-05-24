-- Run in Supabase Dashboard → SQL Editor after creating a project

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Service role (used by server actions/webhooks) bypasses RLS automatically

-- ─────────────────────────────────────────────────────────────────────────────
-- Series (all 6-step wizard / SeriesFormData fields, saved on Schedule click)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  -- Clerk user id (text). No FK: public.users.id is bigint in many Supabase projects.
  clerk_user_id text not null,

  -- Step 1: niche id (e.g. "motivation") or custom text ("custom:Your niche…")
  niche text not null,

  -- Step 2: language modelLangCode (e.g. "en-US"), voice modelName (e.g. "aura-2-thalia-en")
  language text not null,
  voice text not null,

  -- Step 3: video style id (e.g. "cinematic", "pixar-3d")
  video_style text not null,

  -- Step 4: background music track ids
  background_music text[] not null default '{}',

  -- Step 5: caption style id (karaoke | bounce | typewriter | pop | fade-up | neon)
  caption_style text not null,

  -- Step 6: series details
  series_name text not null,
  video_duration text not null,
  platforms text[] not null default '{}',
  publish_time text not null,

  status text not null default 'active'
    check (status in ('active', 'scheduled', 'generating', 'published', 'failed', 'cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists series_clerk_user_id_idx on public.series (clerk_user_id);
create index if not exists series_created_at_idx on public.series (created_at desc);

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists series_set_updated_at on public.series;

create trigger series_set_updated_at
before update on public.series
for each row
execute function public.set_updated_at ();

alter table public.series enable row level security;

-- If you already created the series table, run this in Supabase SQL Editor:
-- alter table public.series drop constraint if exists series_status_check;
-- alter table public.series add constraint series_status_check
--   check (status in ('active', 'scheduled', 'generating', 'published', 'failed', 'cancelled'));
-- alter table public.series alter column status set default 'active';
-- update public.series set status = 'active' where status = 'scheduled';

-- ─────────────────────────────────────────────────────────────────────────────
-- Generated videos (assets from Inngest pipeline) — see migrations/
-- ─────────────────────────────────────────────────────────────────────────────
-- generated_videos + generated_video_scenes (script, audio, captions, scene images)
