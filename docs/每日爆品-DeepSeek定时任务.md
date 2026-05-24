# 每日爆品热点 · DeepSeek 定时任务

每天 **08:00（北京时间）** 自动用 DeepSeek 生成 **32+ 条** 爆品选题，写入 Supabase 表 `daily_hot_topics`。用户打开「今日爆品生成」时优先读库。

---

## 一、环境变量（`.env.local` / Vercel）

| 变量 | 必填 | 说明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | ✅ | [DeepSeek 开放平台](https://platform.deepseek.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 服务端写入 `daily_hot_topics` |
| `CRON_SECRET` | 线上定时必填 | 随机长字符串，保护 `/api/cron/refresh-hot-topics` |
| `SITE_URL` | 可选 | 如 `https://www.emovalue.top`，`--via-api` 时用 |

Vercel 部署后，在 **Settings → Environment Variables** 加上 `CRON_SECRET`（与本地一致或单独生成）。

---

## 二、手动跑一次（推荐先测）

在项目根目录：

```bash
npm run refresh:hot-topics
```

常用参数：

```bash
# 强制覆盖今日数据
node scripts/refresh-daily-hot-topics.mjs --force

# 指定日期
node scripts/refresh-daily-hot-topics.mjs --date 2026-05-23

# 只生成不写库
node scripts/refresh-daily-hot-topics.mjs --dry-run

# 调已部署站点 API（需 CRON_SECRET + SITE_URL）
node scripts/refresh-daily-hot-topics.mjs --via-api
```

成功后会：

1. `daily_hot_topics` 表写入当日爆品选题
2. `daily_inspiration_titles` 表写入发布包「每日灵感标题」（30 条）
3. 更新 `docs/今日爆品热点库.md` 便于查阅

Supabase 需执行迁移：`supabase/migrations/007_daily_inspiration_titles.sql`

---

## 三、定时方式（三选一）

### 方式 A：Vercel Cron（推荐线上）

仓库已含 `vercel.json`：

- 路径：`GET /api/cron/refresh-hot-topics`
- 计划：`0 0 * * *`（UTC 0 点 = **北京时间 8 点**）

Vercel 会自动带 `Authorization: Bearer <CRON_SECRET>`（需在 Vercel 配置同名变量）。

手动触发（部署后）：

```bash
curl -H "Authorization: Bearer 你的CRON_SECRET" \
  "https://www.emovalue.top/api/cron/refresh-hot-topics?force=1"
```

### 方式 B：Windows 任务计划程序（本机/服务器）

1. 打开「任务计划程序」→ 创建基本任务  
2. 触发器：**每天 08:00**  
3. 操作：启动程序  

   - 程序：`node`  
   - 参数：`scripts/refresh-daily-hot-topics.mjs`  
   - 起始于：`E:\emotion-ai-h5`（改成你的项目路径）

4. 确保该机器 `.env.local` 含 DeepSeek + Supabase 密钥

也可用批处理 `scripts/每日8点刷新爆品.bat`（见下）。

### 方式 C：GitHub Actions

在 `.github/workflows/daily-hot-topics.yml` 中配置 secrets：`DEEPSEEK_API_KEY`、`SUPABASE_*`、`CRON_SECRET`，每天 0:00 UTC 调用线上 cron URL 或 checkout 后执行 `node scripts/refresh-daily-hot-topics.mjs`。

---

## 四、与前台的关系

| 场景 | 行为 |
|------|------|
| 库里有今日 ≥30 条 | API / 页面直接用库 |
| 库空或未跑任务 | 用本地 `daily-pool` 静态池兜底（不自动覆盖库） |
| 用户换一批 | 仍按 `dateKey + batch` 洗牌展示 |

跑完定时任务后，老用户可清一次本地缓存键：`sv-v1-hot-topics`（或等次日自动失效）。

---

## 五、费用与失败

- 每日约 2 次 DeepSeek 请求（20 + 18 条），注意账户余额  
- DeepSeek 失败时脚本退出码 1；线上 Cron 可在 Vercel Logs 查看  
- 未配 `DEEPSEEK_API_KEY` 时不会写 AI 内容，请先用 `npm run test:deepseek` 验证

---

## 六、相关文件

- `scripts/refresh-daily-hot-topics.mjs` — 本地/服务器定时入口  
- `src/lib/hot-topics/generate-daily-deepseek.ts` — 生成与归一化  
- `src/app/api/cron/refresh-hot-topics/route.ts` — Vercel Cron HTTP 入口  
- `src/lib/server/db/product-v1.ts` — 读库 `getOrCreateDailyHotTopics`
