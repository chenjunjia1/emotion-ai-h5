-- 热点过滤：安全分、创作价值分、拒绝原因、rejected 状态

alter table public.hot_topics
  drop constraint if exists hot_topics_status_check;

alter table public.hot_topics
  add constraint hot_topics_status_check
  check (status in ('active', 'inactive', 'rejected'));

alter table public.hot_topics
  add column if not exists reject_reason text,
  add column if not exists safe_score int not null default 0,
  add column if not exists content_value_score int not null default 0;

create index if not exists hot_topics_active_display_idx
  on public.hot_topics (status, safe_score desc, content_value_score desc, viral_score desc)
  where status = 'active';
