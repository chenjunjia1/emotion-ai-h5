-- V1 产品重构：邀请、成长、每日热点

alter table public.users
  add column if not exists growth_xp int not null default 0,
  add column if not exists streak_days int not null default 0,
  add column if not exists last_checkin_date date,
  add column if not exists invite_reward_total int not null default 0,
  add column if not exists invite_blind_box_count int not null default 0,
  add column if not exists formula_cards int not null default 0,
  add column if not exists content_pack_trials int not null default 0;

-- invite_code / invited_by / invite_count / bonus_quota 已在 002

create table if not exists public.invite_records (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid not null references public.users(id),
  invitee_user_id uuid references public.users(id),
  invite_code text not null,
  invitee_mobile_masked text,
  reward_status text not null default 'pending'
    check (reward_status in ('pending', 'valid', 'rewarded', 'invalid', 'member_rewarded')),
  inviter_reward_quota int not null default 0,
  invitee_reward_quota int not null default 0,
  member_reward_quota int not null default 0,
  blind_box_reward_count int not null default 0,
  reward_reason text,
  ip text,
  device_id text,
  created_at timestamptz not null default now(),
  registered_at timestamptz,
  rewarded_at timestamptz,
  member_rewarded_at timestamptz
);

create index if not exists invite_records_inviter_idx
  on public.invite_records (inviter_user_id, created_at desc);

create table if not exists public.daily_hot_topics (
  id uuid primary key default gen_random_uuid(),
  topic_date date not null unique,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  usage_date date not null default current_date,
  topic_box_count int not null default 0,
  title_gacha_count int not null default 0,
  viral_score_count int not null default 0,
  hot_topic_gen_count int not null default 0,
  unique (user_id, usage_date)
);

alter table public.invite_records enable row level security;
alter table public.daily_hot_topics enable row level security;
alter table public.user_daily_usage enable row level security;
