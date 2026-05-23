-- 修复 V1 入库：generations 类型、invite_count、成长任务 JSON

-- 邀请人数统计（invite.ts 会更新此列）
alter table public.users
  add column if not exists invite_count int not null default 0;

-- 今日陪跑任务完成记录（服务端校验，非 localStorage）
alter table public.users
  add column if not exists growth_tasks_done jsonb not null default '[]'::jsonb;

-- 放宽 generations.type，支持 V1 全部玩法入库
alter table public.generations drop constraint if exists generations_type_check;

alter table public.generations add constraint generations_type_check check (
  type in (
    'account',
    'daily',
    'viral',
    'publish_pack',
    'topic_box',
    'title_gacha',
    'account_test',
    'review',
    'reply',
    'score',
    'hot_topic'
  )
);
