-- Allow tracking in-progress generations on the videos page
alter table public.generated_videos
  drop constraint if exists generated_videos_status_check;

alter table public.generated_videos
  add constraint generated_videos_status_check
  check (status in ('generating', 'ready', 'rendering', 'failed'));
