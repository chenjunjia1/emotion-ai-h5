-- 废弃表清理：热点已迁至 hot_topics（009+），用户历史已迁至 generations（002/006）
-- 执行前建议在 Supabase SQL Editor 先确认无业务依赖：
--   select count(*) from daily_hot_topics;
--   select count(*) from history_records;

drop table if exists public.daily_hot_topics cascade;
drop table if exists public.history_records cascade;
