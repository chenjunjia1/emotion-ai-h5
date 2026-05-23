-- 上线前补齐：generations 类型、订单商品类型（加油包）

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
    'hot_topic',
    'hot_topic_pack',
    'emotion_chat'
  )
);

alter table public.orders drop constraint if exists orders_product_type_check;

alter table public.orders add constraint orders_product_type_check check (
  product_type in ('membership', 'video_coin', 'quota_pack')
);
