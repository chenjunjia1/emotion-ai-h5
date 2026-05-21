# AI短视频运营助手

一站式短视频运营 H5：起号方案、每日视频脚本、爆款同款、AI 成片 / 数字人。V1 使用 Mock 登录、Mock 支付、本地 Mock 生成，可接 DeepSeek / Supabase。

## 功能（V1）

- **首页**：4 大入口 + 热门玩法 + 会员简介
- **起号** `/account-package`：账号方案生成（5 额度）
- **创作** `/create`：今日视频 / 爆款同款（各 3 额度）
- **成片** `/ai-video`：数字人 / AI 成片，视频币冻结机制
- **我的** `/profile`：登录、会员、视频币、订单、任务、中英切换
- **历史** `/history`
- **后台** `/admin`（手机号以 `0000` 结尾登录为 admin）

## 本地运行

```bash
npm install --cache .npm-cache
npm run dev
```

打开 http://localhost:3000

### Mock 登录

- 验证码固定：`1234`
- Admin 测试号：`13800138000`

## 环境变量（可选，接真实 AI / DB）

复制 `.env.local.example` 为 `.env.local`，配置 DeepSeek 与 Supabase。未配置时 V1 前端 Mock 仍可完整演示。

## 数据库

执行 `supabase/migrations/002_v1_schema.sql`（需先或并行执行 `001_initial.sql`）。

## 备案建议网站名称

**短视频文案助手** 或 **AI短视频运营助手**

## 技术栈

Next.js 15 · React 19 · TypeScript · Tailwind · Framer Motion
