# 部署到 Vercel（手机公网访问）

部署完成后会得到：`https://你的项目名.vercel.app`（临时地址）。

**正式域名（已购买）：** [emovalue.top](https://emovalue.top) — 绑定步骤见 **[DOMAIN-EMOVALUE.md](./DOMAIN-EMOVALUE.md)**。

---

## 方式 A：网页部署（推荐，不用装 Git）

### 1. 代码上传到 GitHub

1. 打开 [https://github.com/new](https://github.com/new)
2. 仓库名：`emotion-ai-h5`，选 **Private** 或 Public → **Create repository**
3. 在电脑上把项目文件夹打成 zip（**不要包含** `node_modules`、`.next`、`.env.local`）
4. GitHub 仓库页 → **uploading an existing file** → 拖入 zip 解压后的文件 → **Commit**

或用 GitHub Desktop / 任意 Git 工具 push 整个 `e:\emotion-ai-h5` 目录。

### 2. 导入 Vercel

1. 打开 [https://vercel.com](https://vercel.com) → 用 GitHub 登录
2. **Add New… → Project**
3. 选择 `emotion-ai-h5` 仓库 → **Import**
4. **Framework Preset** 应为 Next.js（自动识别）
5. **不要改** Build Command / Output Directory（默认即可）

### 3. 配置环境变量（必做）

在 **Environment Variables** 里添加（从本地 `.env.local` 复制值）：

| Name | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek 密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role（仅服务端） |

三个环境都勾选：**Production**、**Preview**、**Development**。

### 4. 部署

点击 **Deploy**，等待 1～3 分钟。

成功后会显示 **Visit**，例如：

`https://emotion-ai-h5-xxx.vercel.app`

用手机浏览器打开该链接即可使用。

---

## 方式 B：命令行部署（本机已登录 Vercel 时）

在项目目录执行：

```bash
cd e:\emotion-ai-h5
npx vercel login
npx vercel
```

按提示选默认项。首次会问是否链接已有项目，选 **N** 新建。

**生产环境：**

```bash
npx vercel --prod
```

环境变量在 [vercel.com](https://vercel.com) 项目 → **Settings → Environment Variables** 中配置（同方式 A 第 3 步）。

---

## 部署后自测

- [ ] 手机打开 `https://xxx.vercel.app` 首页正常
- [ ] 生成一条内容成功
- [ ] 历史记录有数据
- [ ] 复制功能正常

---

## 常见问题

**构建失败**  
本地先执行 `npm run build`，修好错误后再在 Vercel **Redeploy**。

**生成 500**  
检查 Vercel 环境变量是否填全，尤其是 `DEEPSEEK_API_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY`。

**绑定正式域名 emovalue.com**  
见 [DOMAIN-EMOVALUE.md](./DOMAIN-EMOVALUE.md)。

---

## 安全提醒

- 不要把 `.env.local` 提交到 GitHub
- `SUPABASE_SERVICE_ROLE_KEY` 只放在 Vercel 环境变量里，不要加 `NEXT_PUBLIC_` 前缀
