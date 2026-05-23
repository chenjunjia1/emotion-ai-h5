-- 客服反馈表
create table if not exists public.support_feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  type text not null,
  contact text not null default '',
  description text not null default '',
  related_order_no text,
  related_task_id text,
  status text not null default 'pending' check (status in ('pending', 'processed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_feedbacks enable row level security;
