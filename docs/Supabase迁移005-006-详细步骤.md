# Supabase 迁移 005 + 006 — 详细操作步骤

按本文一步一步做，做完后 `npm run test:ingest` 应接近全绿，线上内容库才能入库。

**预计时间**：10～15 分钟（不含 Vercel 构建等待）

---

## 第 0 步：确认前提（30 秒）

你项目里 **已经有** 这些（自测报告里已通过）：

- 表 `users`、`generations`（来自 `002_v1_schema.sql`）
- `.env.local` 里 Supabase URL、Service Role 已填
- `NEXT_PUBLIC_BACKEND_MODE=server`

若 Table Editor 里 **没有** `users` 表，请先执行 `002_v1_schema.sql`，再回来做 005、006。

---

## 第 1 步：打开 Supabase SQL Editor

1. 浏览器打开 [https://supabase.com/dashboard](https://supabase.com/dashboard) 并登录。
2. 点进你的项目（和 `.env.local` 里 `NEXT_PUBLIC_SUPABASE_URL` 对应的那个）。
3. 左侧菜单点 **SQL Editor**（数据库图标下面）。
4. 右上角点 **+ New query**（新建查询）。

你会看到一个空白 SQL 编辑区，下面有 **Run**（或 Ctrl+Enter 运行）。

---

## 第 2 步：执行迁移 005（邀请 / 成长 / 每日限额）

### 2.1 复制 SQL

1. 在电脑上打开文件夹：`e:\emotion-ai-h5\supabase\migrations\`
2. 用记事本 / VS Code 打开文件：**`005_v1_product_invite_growth.sql`**
3. **Ctrl+A 全选** → **Ctrl+C 复制**（整文件约 59 行，不要只复制一半）

### 2.2 粘贴并运行

1. 回到 Supabase SQL Editor 空白页。
2. **Ctrl+V 粘贴** 全部内容。
3. 点击右下角绿色 **Run**（或按 Ctrl+Enter）。

### 2.3 怎样算成功

- 下方 Results 区域显示 **Success**，或绿色提示无报错。
- **不要**出现红色 `ERROR`（若报错见文末「常见报错」）。

### 2.4 在 Table Editor 肉眼确认（必做）

左侧点 **Table Editor**，检查是否出现 **3 张新表**：

| 表名 | 说明 |
|------|------|
| `invite_records` | 邀请记录 |
| `daily_hot_topics` | 每日热点 |
| `user_daily_usage` | 每日盲盒/扭蛋/打分次数 |

再点开表 **`users`**，在列列表里应能看到（往下滚）：

- `growth_xp`
- `streak_days`
- `last_checkin_date`
- `invite_blind_box_count`
- `invite_reward_total`
- …（005 新增的列）

**看不到这 3 张表 → 005 没成功，不要执行 006，先排查报错。**

---

## 第 3 步：执行迁移 006（入库类型 + invite_count）

### 3.1 复制 SQL

1. 打开：`e:\emotion-ai-h5\supabase\migrations\006_fix_generations_and_invite.sql`
2. **Ctrl+A → Ctrl+C**（整文件约 29 行）

### 3.2 粘贴并运行

1. SQL Editor 再点 **+ New query**（新开一页，避免和 005 混在一起）。
2. 粘贴 → **Run**。

### 3.3 怎样算成功

- Results：**Success**，无红色 ERROR。

### 3.4 Table Editor 再确认

1. 表 **`users`** 列里应有：
   - `invite_count`
   - `growth_tasks_done`
2. 表 **`generations`** 不用新建表，只是放宽了 `type` 字段允许的值（在库里看不出来，要靠第 5 步自测）。

---

## 第 4 步：Vercel Redeploy（让线上也用新库结构）

迁移只改 **数据库**，Vercel 上的代码要重新部署一次（通常 1～2 分钟）。

1. 打开 [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. 进入项目 **`emotion-ai-h5`**（或你绑 `emovalue.top` 的那个）
3. 顶部菜单 **Deployments**
4. 找到最新一条部署，右侧 **⋯** → **Redeploy**
5. 弹窗里 **不要**勾选 “Use existing Build Cache”（有的话取消勾选，强制完整构建更稳）
6. 点 **Redeploy**，等到状态变成 **Ready**（绿点）

### 环境变量快速核对（同一项目 Settings → Environment Variables）

| 变量名 | 应为 |
|--------|------|
| `NEXT_PUBLIC_BACKEND_MODE` | `server` |
| `NEXT_PUBLIC_SUPABASE_URL` | 与本地 `.env.local` 同一项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 已填（eyJ 开头） |
| `SESSION_SECRET` | 至少 16 位 |

改 env 后也要再 Redeploy 一次。

---

## 第 5 步：本地自动复测（两个终端）

### 终端 A — 启动开发服务

```powershell
cd e:\emotion-ai-h5
npm run dev
```

等到出现类似：

```text
✓ Ready in ...
- Local: http://localhost:3000
```

（若 3000 被占用，可能是 3001 / 3002，脚本会自动探测。）

### 终端 B — 跑入库自测

**不要关终端 A**，新开 PowerShell：

```powershell
cd e:\emotion-ai-h5
npm run test:ingest
```

### 5.1 迁移后「应该看到」的输出（对照）

终端里 **失败应明显减少**，重点看这几行是否为 **PASS**：

| 终端里显示的用例 | 迁移前 | 迁移后预期 |
|------------------|--------|------------|
| 表 invite_records 可读 | FAIL | **PASS** |
| 表 user_daily_usage 可读 | FAIL | **PASS** |
| users.invite_count（006） | FAIL | **PASS** |
| generations.type=topic_box（006） | FAIL | **PASS** |
| POST /api/v1/topic-box | saved=**false** | saved=**true** |
| DB: topic_box 写入 generations | FAIL | **PASS** |
| DB: user_daily_usage.topic_box_count | FAIL | **PASS**（count≥1） |
| POST /api/v1/growth checkin | streak=0 | streak **≥1** |
| DB: 签到写入 users 成长字段 | FAIL | **PASS** |
| GET /api/me?sync=1 内容库 | histories=0 | histories **≥1** |

最后一行汇总类似：

```text
合计: ✅ 20+  ❌ 0～1  ⏭️ 0～1
```

（邀请盲盒若跳过 1 项可接受。）

完整表格会写入：`docs/测试报告-入库自测.md`（每次跑脚本会覆盖更新）。

---

## 第 6 步：在 Supabase 里手动核对 4 条（和自测一致）

自测跑完后，用 **Table Editor** 对照（用你刚登录测试的手机号找用户，或看 `generations` 最新几行）。

### ① topic-box → generations

1. 打开表 **`generations`**
2. 按 `created_at` **降序** 排序
3. 最新一行应：
   - `type` = **`topic_box`**
   - `topic` 有内容
   - `output` 为 JSON（选题结果）

### ② 每日次数 user_daily_usage

1. 打开表 **`user_daily_usage`**
2. 找 **今天日期** 的 `usage_date`（格式 `YYYY-MM-DD`）
3. 对应你的 `user_id` 那一行：
   - **`topic_box_count` ≥ 1**

### ③ 内容库 histories（接口侧）

自测里 `GET /api/me?sync=1` 的 `histories` 来自 `generations` 表；Table Editor 里 `generations` 有行，线上「内容库」就会有。

### ④ 签到 streak

1. 打开表 **`users`**
2. 找到测试用户那一行：
   - **`streak_days` ≥ 1**
   - **`growth_xp` > 0**（签到会加经验）
   - **`last_checkin_date`** = 今天日期

---

## 第 7 步：线上网站点两下（可选）

1. 打开 [https://www.emovalue.top](https://www.emovalue.top)
2. 登录 → 进 **今日选题盲盒** 抽一次
3. 进 **内容库 / 历史** 看是否出现刚抽的记录

若本地自测全绿但线上没有：几乎一定是 **Vercel 没 Redeploy** 或 env 不是 `server` 模式。

---

## 常见报错

| 报错大意 | 处理 |
|----------|------|
| `relation "public.users" does not exist` | 先跑 `002_v1_schema.sql` |
| `column "invite_count" already exists` | 006 已跑过，可跳过 006 或忽略 duplicate |
| `constraint "generations_type_check" already exists` | 006 跑过一半；只执行 006 里 `drop constraint` + `add constraint` 两段 |
| 005 成功但 006 报错 | 把完整红色 ERROR 复制下来排查；不要重复执行已成功的 `create table` |

---

## 一键命令备忘

```powershell
# 配置检查
npm run check:env

# 入库自测（需另开窗口 npm run dev）
npm run test:ingest
```

---

## 相关文档

- 验收清单：`docs/入库验收.md`
- 自测报告（自动生成）：`docs/测试报告-入库自测.md`
- GitHub / Vercel 部署：`docs/部署最新版-3步.md`、`docs/GITHUB上传-5步.md`
