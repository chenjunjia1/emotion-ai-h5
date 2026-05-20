# 情绪价值助手

AI 情感运营助手 H5 —— 帮助婚恋红娘、情感博主、新媒体运营、私域客服快速生成情感内容与聊天回复。

## 技术栈

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- **DeepSeek API**（AI 生成）
- **Supabase**（历史记录 + 行为埋点）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件并填写：

```bash
cp .env.local.example .env.local
```

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | [DeepSeek 开放平台](https://platform.deepseek.com/) 获取；未配置时自动使用 Mock |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key（仅服务端，勿泄露） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 可选，预留后续客户端能力 |

### 3. 初始化 Supabase 表

在 Supabase Dashboard → **SQL Editor** 中执行：

`supabase/migrations/001_initial.sql`

将创建：

- `user_events` — 行为埋点
- `history_records` — 生成历史

### 4. 启动开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/generate` | POST | 调用 DeepSeek 生成内容，并写入历史 |
| `/api/events` | POST | 写入 `user_events` 埋点 |
| `/api/history` | GET | 按 `session_id` 读取历史（请求头 `x-session-id`） |

## 页面结构

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/generate` | AI 生成页 |
| `/result` | 生成结果页 |
| `/history` | 历史记录 |
| `/mine` | 我的 |

## 项目结构

```
src/
├── app/api/          # 服务端 API（DeepSeek + Supabase）
├── lib/
│   ├── ai/           # DeepSeek 提示词、解析
│   ├── supabase/     # 数据库读写
│   ├── api-client.ts # 前端调用封装
│   └── session.ts    # 匿名 session_id（localStorage）
supabase/migrations/  # SQL 建表脚本
```

## 部署到 Vercel（手机公网 H5）

详细步骤见 **[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)**。

简要流程：

1. 代码上传到 GitHub（不要上传 `.env.local`、`node_modules`）
2. [vercel.com](https://vercel.com) → Import 项目
3. 配置 4 个环境变量（与 `.env.local` 相同）
4. Deploy → 用手机打开 `https://xxx.vercel.app`
