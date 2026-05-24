# 每日 8 点热点 Cron 验收

## 机制说明

| 项 | 值 |
|----|-----|
| 触发时间 | `vercel.json` → `0 0 * * *`（**UTC 0:00 = 北京时间 08:00**） |
| 接口 | `GET /api/cron/refresh-hot-topics` |
| 鉴权 | Header `Authorization: Bearer <CRON_SECRET>` |
| 作用 | DeepSeek 生成当日 **爆品热点** + **每日灵感标题** 写入 Supabase |

Vercel 会在配置了 `CRON_SECRET` 环境变量时，自动在 Cron 请求里带上 Bearer Token。

---

## 上线前检查

1. Vercel → **Environment Variables** → `CRON_SECRET`（≥16 位随机字符串）
2. 与本地 `.env.local` 中 **同一值**（便于本地脚本验收）
3. **Redeploy** 后 → 项目 **Settings → Cron Jobs** 能看到任务

```bash
npm run check:env    # 看 CRON_SECRET + vercel.json
npm run verify:cron  # 本地 dev 或线上探活（仅鉴权，不刷库）
```

`verify:cron` 请求带 `?probe=1`，只验证密钥，不调用 DeepSeek。

---

## 手动触发（运维）

```bash
# 本地或 CI（勿泄露 CRON_SECRET）
curl -H "Authorization: Bearer 你的CRON_SECRET" \
  "https://www.emovalue.top/api/cron/refresh-hot-topics"

# 强制覆盖当日数据
curl -H "Authorization: Bearer 你的CRON_SECRET" \
  "https://www.emovalue.top/api/cron/refresh-hot-topics?force=1"
```

或使用 npm 脚本（读 `.env.local`）：

```bash
npm run refresh:hot-topics
```

---

## Vercel 计划说明

- **Hobby**：支持 Cron，有次数/频率限制（1 条日更 cron 通常够用）
- **Pro**：Cron 额度更高、日志更全

若 Cron 未执行：检查 Deployments 日志、Cron Jobs 面板、以及 `CRON_SECRET` 是否在 **Production** 环境已保存。

---

## 失败排查

| 现象 | 原因 |
|------|------|
| 401 unauthorized | `CRON_SECRET` 未配或与代码不一致 |
| 500 hot_save_failed | Supabase 未迁移或 DB 不可用 |
| 热点仍是旧池 | 当日已有 ≥30 条会 skip；加 `?force=1` |
