# 配置指南（一步步照做）

以下密钥需要你在官网注册后**自己复制**，我无法代你申请账号或生成 key。

---

## 第一步：DeepSeek API Key

1. 打开 [https://platform.deepseek.com](https://platform.deepseek.com) 注册/登录
2. 进入 **API Keys** → 创建新 Key
3. 复制以 `sk-` 开头的密钥
4. 打开项目根目录 `.env.local`，修改：

```env
DEEPSEEK_API_KEY=sk-粘贴你的真实key
```

> 不填也能跑：会自动用 Mock 假数据，但无法体验真实 AI。

---

## 第二步：Supabase 项目

1. 打开 [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. 记下项目创建完成后的：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Settings → API → anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Settings → API → service_role**（点 Reveal）→ `SUPABASE_SERVICE_ROLE_KEY`

3. 填入 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

⚠️ `service_role` **不要**加 `NEXT_PUBLIC_` 前缀，不要提交到 Git。

---

## 第三步：执行建表 SQL

1. Supabase 左侧 **SQL Editor** → **New query**
2. 打开本仓库文件 `supabase/migrations/001_initial.sql`，全选复制
3. 粘贴到 SQL Editor → 点击 **Run**
4. 成功后会看到 `user_events`、`history_records` 两张表

左侧 **Table Editor** 可确认表是否创建成功。

---

## 第四步：验证配置

```bash
node scripts/check-config.mjs
```

全部 ✅ 后重启：

```bash
npm run dev
```

---

## 第五步：功能自测

| 操作 | 预期 |
|------|------|
| 生成页输入内容 → AI 生成 | Network 有 `POST /api/generate` 返回 200 |
| 历史页 | 出现刚生成的记录 |
| 复制内容 | Network 有 `POST /api/events`，event 为 `copy_content` |
| Supabase Table Editor | `history_records` 有新行 |

---

## 常见问题

**生成报错 500 + DeepSeek**
- 检查 `DEEPSEEK_API_KEY` 是否正确、账户是否有余额

**历史为空但生成成功**
- 检查 Supabase 三个变量是否填对
- 确认 SQL 已执行
- 终端是否有 `[api/generate]` 相关报错

**只想先跑通 UI**
- 只配 DeepSeek 或都不配：生成走 Mock，历史走 Mock 示例数据
