-- H5 + 小程序：微信身份、订阅消息、每日热点推送广播

alter table public.users
  add column if not exists mini_openid text,
  add column if not exists unionid text;

create unique index if not exists users_mini_openid_unique
  on public.users (mini_openid)
  where mini_openid is not null;

create index if not exists users_unionid_idx
  on public.users (unionid)
  where unionid is not null;

comment on column public.users.mini_openid is '微信小程序 openid';
comment on column public.users.unionid is '微信开放平台 unionid（绑定公众号/小程序后）';

-- 每日广播（Cron 写入，H5/小程序铃铛拉取）
create table if not exists public.push_broadcasts (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  date_key text not null,
  title text not null,
  body text not null,
  href text not null default '/hot-topics',
  emoji text not null default '🔥',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (kind, date_key)
);

create index if not exists push_broadcasts_kind_date_idx
  on public.push_broadcasts (kind, date_key desc);

-- 用户订阅的小程序模板（用于 Cron 后推送）
create table if not exists public.wechat_subscribe_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  openid text not null,
  template_id text not null,
  subscribed_at timestamptz not null default now(),
  unique (user_id, template_id)
);

create index if not exists wechat_subscribe_openid_idx
  on public.wechat_subscribe_logs (openid);
