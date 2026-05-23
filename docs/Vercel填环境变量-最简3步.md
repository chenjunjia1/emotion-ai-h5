# Vercel 填环境变量 — 最简 3 步（约 5 分钟）

本机配置我已写好，**你只需要在 Vercel 网页点几下**。

## 第 1 步：打开页面

1. 浏览器打开 https://vercel.com 并登录  
2. 点击项目 **`emotion-ai-h5-v2`**  
3. 顶部 **Settings** → 左侧 **Environment Variables**

（也可双击运行 `scripts\打开Vercel并复制环境变量.ps1`，会在终端列出 8 对要填的内容。）

## 第 2 步：加 8 条变量

点 **Add New**，每一对：

- **Key** = 下面左边  
- **Value** = 下面右边  
- **Environment** 三个都勾选 → **Save**

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 控制台 → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role（勿泄露） |
| `SESSION_SECRET` | 自行生成 32 位以上随机字符串 |
| `CRON_SECRET` | 自行生成随机长字符串 |
| `ADMIN_MOBILES` | 你的管理员手机号 |
| `NEXT_PUBLIC_BACKEND_MODE` | `server` |
| `SMS_PROVIDER` | `dev` |
| `PAY_PROVIDER` | `mock` |

（DeepSeek 有 key 再加 `DEEPSEEK_API_KEY`，没有可跳过。）

## 第 3 步：重新部署

**Deployments** → 最新一条右侧 **⋯** → **Redeploy** → 等 **Ready**

---

## 我为什么不能替你点 Vercel？

需要你的 Vercel 账号登录，我这边无法代替你操作网页。

## 填完后测试

网站 → 登录 → 获取验证码 → Vercel **Logs** 里看 6 位验证码。
