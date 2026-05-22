-- Run in Supabase Dashboard → SQL Editor after creating a project

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Service role (used by server actions/webhooks) bypasses RLS automatically
