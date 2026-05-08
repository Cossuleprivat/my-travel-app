-- supabase/migrations/0009_avatar_system.sql

-- 1. Avatar-Felder zur user_profiles Tabelle hinzufügen
alter table public.user_profiles
  add column if not exists avatar_url           text,
  add column if not exists avatar_generated_at  timestamptz,
  add column if not exists avatar_generation_month integer,   -- Format: YYYYMM z.B. 202605
  add column if not exists avatar_generation_count integer not null default 0;

-- 2. Storage Bucket für Avatare erstellen (private, 5 MB Limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- 3. RLS Policies für den Bucket
create policy "users_can_upload_own_avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users_can_read_own_avatar"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users_can_update_own_avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users_can_delete_own_avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
