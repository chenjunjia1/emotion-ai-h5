-- 原子扣减灵感（先扣 daily 再扣 bonus），避免并发双扣
create or replace function public.deduct_user_quota(
  p_user_id uuid,
  p_cost int,
  p_reason text
)
returns table (
  ok boolean,
  used_count int,
  bonus_quota int,
  daily_quota int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_daily int;
  v_used int;
  v_bonus int;
  v_remain int;
  v_from_daily int;
  v_from_bonus int;
begin
  if p_cost <= 0 then
    select u.daily_quota, u.used_count, u.bonus_quota
    into v_daily, v_used, v_bonus
    from public.users u
    where u.id = p_user_id
    for update;

    if not found then
      return query select false, 0, 0, 0;
      return;
    end if;

    return query select true, v_used, v_bonus, v_daily;
    return;
  end if;

  select u.daily_quota, u.used_count, u.bonus_quota
  into v_daily, v_used, v_bonus
  from public.users u
  where u.id = p_user_id
  for update;

  if not found then
    return query select false, 0, 0, 0;
    return;
  end if;

  v_remain := greatest(0, v_daily - v_used);
  if v_remain + v_bonus < p_cost then
    return query select false, v_used, v_bonus, v_daily;
    return;
  end if;

  v_from_daily := least(v_remain, p_cost);
  v_from_bonus := p_cost - v_from_daily;
  v_used := v_used + v_from_daily;
  v_bonus := v_bonus - v_from_bonus;

  update public.users u
  set used_count = v_used, bonus_quota = v_bonus, updated_at = now()
  where u.id = p_user_id;

  insert into public.quota_logs (user_id, change_type, amount, reason, before_quota, after_quota)
  values (
    p_user_id,
    'deduct',
    -p_cost,
    p_reason,
    v_remain,
    greatest(0, v_daily - v_used) + v_bonus
  );

  return query select true, v_used, v_bonus, v_daily;
end;
$$;
