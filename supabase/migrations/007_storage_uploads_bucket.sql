-- 管理后台封面上传：公开 Storage 桶（也可由服务端 createBucket 自动创建）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 公开读
drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read"
  on storage.objects for select
  using (bucket_id = 'uploads');

-- 服务端 service_role 写入（管理后台上传 API）
drop policy if exists "uploads_service_insert" on storage.objects;
create policy "uploads_service_insert"
  on storage.objects for insert
  with check (bucket_id = 'uploads');

drop policy if exists "uploads_service_update" on storage.objects;
create policy "uploads_service_update"
  on storage.objects for update
  using (bucket_id = 'uploads');
