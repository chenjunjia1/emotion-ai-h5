-- TikHub 小红书热门图文灵感（每日 8 点 Cron 写入，前端读缓存）
create table if not exists public.xhs_hot_notes_daily (
  id uuid primary key default gen_random_uuid(),
  topic_date date not null unique,
  notes jsonb not null default '[]'::jsonb,
  note_count int not null default 0,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_xhs_hot_notes_daily_fetched
  on public.xhs_hot_notes_daily (fetched_at desc);

alter table public.xhs_hot_notes_daily enable row level security;
