# 线上还是「情绪价值助手」？3 步换成新站（AI短视频运营助手）

**原因：** 当前 Vercel 项目是 **网页上传（Add files via upload）** 的旧代码；你在 GitHub 上的新代码 **没有** 被这个项目使用。Redeploy 只会重复旧版。

**目标：** 从 GitHub **重新导入** 项目，部署最新代码。

预计 **10 分钟**（需登录 Vercel + GitHub）。

---

## 第 1 步：确认 GitHub 已是新代码（30 秒）

打开：https://github.com/chenjunjia1/emotion-ai-h5

在仓库**根目录**（不要进子文件夹）应能看到：

- 文件夹：`src`、`docs`、`supabase`
- 点开 `src/app/` 应有：`account-package`、`create`、`hot-plays`、`ai-video`、`profile`

若没有 `account-package`，请把本机 `E:\emotion-ai-h5` 里**除** `node_modules`、`.next` 外的文件再上传一次到 GitHub 根目录。

---

## 第 2 步：从 GitHub 新建 Vercel 项目（5 分钟）

1. 打开 https://vercel.com/new  
2. 左侧选 **Import Git Repository**  
3. 找到 **`chenjunjia1/emotion-ai-h5`** → **Import**  
4. **Project Name** 可填：`emotion-ai-h5-v2`（避免和旧项目混淆）  
5. **Framework**：Next.js（自动）  
6. **Environment Variables** — 从旧项目复制这 4 个（旧项目 → Settings → Environment Variables）：

   | Name |
   |------|
   | `DEEPSEEK_API_KEY` |
   | `NEXT_PUBLIC_SUPABASE_URL` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `SUPABASE_SERVICE_ROLE_KEY` |

7. 点击 **Deploy**，等待 **Ready**（约 1～3 分钟）

8. 点 **Visit**，地址类似：  
   `https://emotion-ai-h5-v2.vercel.app`

**成功标志：** 首页是「AI短视频运营助手」，底部是 **首页 | 起号 | 创作 | 成片 | 我的**。

---

## 第 3 步：域名与旧项目（可选）

### 临时先用新地址

把新链接 `https://emotion-ai-h5-v2.vercel.app` 发给用户测试即可。

### 要用 `emovalue.top`

1. **新项目** → Settings → Domains → 添加 `emovalue.top`、`www.emovalue.top`  
2. **旧项目** → Settings → Domains → 删除这两个域名（避免冲突）  
3. 在阿里云 DNS 按 Vercel 提示改解析，等 SSL 变绿

### 旧项目 `emotion-ai-h5.vercel.app`

可保留或删除旧项目，不影响新站。

---

## 以后更新：不用 Upload，推 Git 即可

### 方式 A：Vercel 连 Git（推荐）

新项目默认已连 GitHub，以后在 GitHub 改代码 → Commit → Vercel 自动部署。

### 方式 B：GitHub Actions（仓库已含 workflow）

1. GitHub 仓库 → **Settings → Secrets and variables → Actions**  
2. 新建 3 个 Secret（见 `.github/workflows/deploy-vercel.yml` 顶部注释）  
3. 每次 push `main` 自动 `npm run build` 并部署

---

## 常见问题

**Q：新站对了，旧链接还是旧的？**  
旧链接绑的是旧项目，请用 **新 Visit 地址**，或把域名改绑到新项目。

**Q：构建失败？**  
Deployments → 失败那条 → **Build Logs**，把最后 20 行发给开发者。

**Q：手机还看到旧界面？**  
无痕模式打开，或清除浏览器缓存。
