-- Public bucket for generated voiceovers and other media assets
insert into storage.buckets (id, name, public)
values ('generated-media', 'generated-media', true)
on conflict (id) do update set public = true;

create policy "Public read generated media"
on storage.objects for select
using (bucket_id = 'generated-media');

create policy "Service role upload generated media"
on storage.objects for insert
with check (bucket_id = 'generated-media');

create policy "Service role update generated media"
on storage.objects for update
using (bucket_id = 'generated-media');
