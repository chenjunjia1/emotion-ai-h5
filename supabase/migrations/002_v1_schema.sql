-- AI短视频运营助手 V1.0 数据表
-- 在 Supabase SQL Editor 执行（保留 001 的 user_events / history_records 亦可）

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  mobile text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium', 'studio')),
  daily_quota int not null default 3,
  used_count int not null default 0,
  bonus_quota int not null default 0,
  video_coin int not null default 0,
  frozen_video_coin int not null default 0,
  membership_expire_at timestamptz,
  invite_code text,
  invited_by uuid references public.users(id),
  language text not null default 'zh' check (language in ('zh', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  order_no text unique not null,
  product_type text not null check (product_type in ('membership', 'video_coin')),
  product_name text not null,
  amount numeric(10,2) not null,
  pay_channel text not null default 'mock',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'closed')),
  transaction_id text,
  benefit_granted boolean not null default false,
  benefit_granted_at timestamptz,
  paid_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  old_status text,
  new_status text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.quota_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  change_type text not null,
  amount int not null,
  reason text,
  before_quota int,
  after_quota int,
  related_order_id uuid references public.orders(id),
  related_generation_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.video_coin_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  change_type text not null check (change_type in ('freeze', 'consume', 'refund', 'purchase', 'grant', 'deduct')),
  amount int not null,
  reason text,
  before_coin int,
  after_coin int,
  before_frozen_coin int,
  after_frozen_coin int,
  related_order_id uuid references public.orders(id),
  related_task_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.video_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  task_type text not null check (task_type in ('avatar', 'auto')),
  script text not null default '',
  prompt text,
  provider text not null default 'mock',
  status text not null default 'pending' check (status in ('pending', 'processing', 'success', 'failed')),
  cost_video_coin int not null default 0,
  frozen_video_coin int not null default 0,
  video_url text,
  error_message text,
  risk_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  session_id text,
  type text not null check (type in ('account', 'daily', 'viral')),
  topic text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  cost_quota int not null default 0,
  risk_level text,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  content_type text not null,
  content text not null default '',
  risk_level text not null,
  risk_types jsonb not null default '[]'::jsonb,
  risk_words jsonb not null default '[]'::jsonb,
  suggestion text,
  safe_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.sms_logs (
  id uuid primary key default gen_random_uuid(),
  mobile text not null,
  ip text,
  device_id text,
  code text not null,
  status text not null default 'sent',
  fail_count int not null default 0,
  expired_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  ip text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.generations enable row level security;
alter table public.video_tasks enable row level security;
