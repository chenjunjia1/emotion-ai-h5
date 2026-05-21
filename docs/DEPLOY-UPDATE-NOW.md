# 一键更新线上（Vercel + GitHub）

本地已 `npm run build` 通过即可按下面做。**约 10 分钟**（不含首次连仓库）。

---

## A. 本机打包（已提供脚本）

在 PowerShell 执行：

```powershell
cd E:\emotion-ai-h5
powershell -ExecutionPolicy Bypass -File .\scripts\pack-for-github.ps1
```

会生成：`E:\emotion-ai-h5\dist\emotion-ai-h5-deploy.zip`

---

## B. 上传到 GitHub

### 若已有仓库 `chenjunjia1/emotion-ai-h5`（或你的仓库名）

1. 打开 GitHub 仓库 → **Code** → 确认当前分支（一般是 `main`）
2. **解压** zip 到临时文件夹，把**里面所有文件**拖进仓库网页（或 Upload files）
3. 页面底部 **Commit changes** → 写说明如 `v1.0.1 热门玩法/i18n/客服联系方式`

### 若还没有仓库

1. https://github.com/new → 名称 `emotion-ai-h5` → Create
2. **uploading an existing file** → 上传 zip 解压后的全部文件 → Commit

---

## C. Vercel 自动部署

1. 打开 https://vercel.com → 你的项目
2. **Deployments** 里应出现新的一条 **Building**（连了 GitHub 会自动触发）
3. 若没有自动部署：**Deployments** → 右上角 **⋯** → **Redeploy** → **Production**

### 环境变量（首次或换 key 时核对）

**Settings → Environment Variables**，Production 需有：

| 变量名 |
|--------|
| `DEEPSEEK_API_KEY` |
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` |

改完变量后要 **Redeploy** 一次才生效。

---

## D. 部署成功怎么验

1. 打开 Vercel 给的地址，如 `https://emotion-ai-h5-xxx.vercel.app`
2. 手机浏览器访问同一链接
3. 检查：热门玩法可点、我的里可切 EN、客服微信/邮箱正确

---

## E. 命令行部署（可选，需本机已 `vercel login`）

```powershell
cd E:\emotion-ai-h5
npx vercel --prod
```

按提示登录并选已有项目。

---

## F. 国内服务器（阿里云）更新

SSH 后：

```bash
cd /var/www/emotion-ai-h5
git pull
npm install
npm run build
pm2 list          # 看进程名
pm2 restart emotion-ai-h5   # 或 emotion-ai
```

无 Git：把 zip 上传到服务器解压覆盖后，同样执行 `npm install`、`npm run build`、`pm2 restart`。

---

## 我无法代你完成的部分

- GitHub / Vercel **登录授权**（必须在你浏览器完成）
- 阿里云 **SSH 密码/密钥**

打包 zip 和构建检查可以在本机帮你做；上传和点 Deploy 需要你在网页上点几下。
