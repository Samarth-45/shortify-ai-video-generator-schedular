-- Generated video assets (one row per generation run)
create table if not exists public.generated_videos (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null,
  clerk_user_id text not null,

  title text not null,
  script text not null,

  audio_url text not null,
  caption_url text,
  caption_style text not null,
  duration_seconds numeric,

  status text not null default 'ready'
    check (status in ('generating', 'ready', 'rendering', 'failed')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generated_videos_series_id_idx
  on public.generated_videos (series_id);

create index if not exists generated_videos_clerk_user_id_idx
  on public.generated_videos (clerk_user_id);

create index if not exists generated_videos_created_at_idx
  on public.generated_videos (created_at desc);

-- Scene images linked to a generated video
create table if not exists public.generated_video_scenes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.generated_videos (id) on delete cascade,
  scene_number int not null,
  prompt text not null,
  image_url text not null,
  created_at timestamptz not null default now(),

  unique (video_id, scene_number)
);

create index if not exists generated_video_scenes_video_id_idx
  on public.generated_video_scenes (video_id);

drop trigger if exists generated_videos_set_updated_at on public.generated_videos;

create trigger generated_videos_set_updated_at
before update on public.generated_videos
for each row
execute function public.set_updated_at ();

alter table public.generated_videos enable row level security;
alter table public.generated_video_scenes enable row level security;
