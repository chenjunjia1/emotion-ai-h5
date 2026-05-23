-- 100 并发读写优化索引
create index if not exists user_events_session_created_idx
  on public.user_events (session_id, created_at desc);

create index if not exists history_records_session_created_idx
  on public.history_records (session_id, created_at desc);
