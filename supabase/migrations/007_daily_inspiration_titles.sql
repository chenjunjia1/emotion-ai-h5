-- 发布包「每日灵感标题」
create table if not exists public.daily_inspiration_titles (
  id uuid primary key default gen_random_uuid(),
  topic_date date not null unique,
  titles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.daily_inspiration_titles enable row level security;
