# 每日热点定时刷新（Vercel Cron）

## 时间

`vercel.json` 中 `0 0 * * *` 为 **UTC 0:00**，对应 **北京时间 8:00**。

## 环境变量

在 Vercel 项目 Settings → Environment Variables 配置：

| 变量 | 说明 |
|------|------|
| `CRON_SECRET` | 随机长字符串，Cron 鉴权用 |
| `TIANAPI_KEY` | 天聚数行热榜 |
| `DEEPSEEK_API_KEY` | 热点 AI 改写 |
| `SUPABASE_SERVICE_ROLE_KEY` | 入库 |
| `NEXT_PUBLIC_BACKEND_MODE` | `server` |

## 手动触发（本地 / 运维）

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/refresh-hot-topics?force=1"
```

或使用 npm：

```bash
BASE_URL=http://localhost:3000 npm run seed:hot-topics:force
```

## 验收

- `/api/hot-topics?platform=all&limit=30` 的 `meta.total` ≥ 22
- `/hot-topics` 双列展示可拍选题，无新闻原文行
