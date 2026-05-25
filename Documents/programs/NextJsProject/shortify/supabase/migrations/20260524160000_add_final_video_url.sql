alter table public.generated_videos
  add column if not exists final_video_url text;
