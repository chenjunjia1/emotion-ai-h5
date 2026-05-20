-- 情绪价值助手 MVP 数据库
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 用户行为埋点
create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_events_session_id_idx on public.user_events (session_id);
create index if not exists user_events_event_idx on public.user_events (event);
create index if not exists user_events_created_at_idx on public.user_events (created_at desc);

-- 生成历史记录
create table if not exists public.history_records (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  feature_type text not null check (feature_type in ('video', 'comment', 'private')),
  user_input text not null default '',
  ai_result text not null default '',
  style text,
  audience text,
  created_at timestamptz not null default now()
);

create index if not exists history_records_session_id_idx on public.history_records (session_id);
create index if not exists history_records_created_at_idx on public.history_records (created_at desc);

-- 启用 RLS（服务端使用 service_role 写入，客户端不直连表）
alter table public.user_events enable row level security;
alter table public.history_records enable row level security;

-- MVP 暂不开放 anon 直连；所有读写经 Next.js API + service_role
