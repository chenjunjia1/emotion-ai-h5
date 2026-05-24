-- 今日热点：DailyHotApi + AI 加工后的结构化热点表

create table if not exists public.hot_topics (
  id uuid primary key default gen_random_uuid(),
  raw_title text not null,
  display_title text not null,
  summary text not null default '',
  platform text not null default 'web',
  heat_value text not null default '0',
  heat_score int not null default 0,
  cover_image text not null default '/images/hot/default.svg',
  category text not null default '生活',
  tags text[] not null default '{}',
  target_users text[] not null default '{}',
  recommend_angles text[] not null default '{}',
  viral_score int not null default 70 check (viral_score >= 0 and viral_score <= 99),
  source_url text,
  is_new boolean not null default true,
  status text not null default 'active' check (status in ('active', 'inactive')),
  updated_batch_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hot_topics_batch_status_idx
  on public.hot_topics (updated_batch_date desc, status);

create index if not exists hot_topics_active_sort_idx
  on public.hot_topics (status, viral_score desc, heat_score desc)
  where status = 'active';

create index if not exists hot_topics_platform_idx
  on public.hot_topics (platform)
  where status = 'active';

create index if not exists hot_topics_category_idx
  on public.hot_topics (category)
  where status = 'active';

alter table public.hot_topics enable row level security;
