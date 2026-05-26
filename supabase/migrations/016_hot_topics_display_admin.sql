-- 管理后台可配置的热点展示字段（前端有值则优先展示）

alter table public.hot_topics
  add column if not exists badge_label text,
  add column if not exists likes_label text,
  add column if not exists saves_label text,
  add column if not exists comments_label text,
  add column if not exists display_order int not null default 0;

create index if not exists hot_topics_batch_order_idx
  on public.hot_topics (updated_batch_date desc, display_order asc, viral_score desc);
