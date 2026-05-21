# 域名 emovalue.top 配置指南

品牌对应：**情绪价值助手**（Emotion Value · AI 情感运营助手）

正式访问地址目标：**https://emovalue.top**

> 若你买的是 `.com`，把下文 `emovalue.top` 替换成 `emovalue.com` 即可，步骤相同。

---

## 第 1 步：购买域名 ✅

你已购买：**emovalue.top**（1 年）

在阿里云左侧点 **域名 → 域名列表**，应能看到 `emovalue.top` 状态为正常。  
（**不要**用「万小智 AI 建站」来部署本项目，那是另一套建站产品。）

---

## 第 2 步：项目先部署到 Vercel

尚未部署时，按 [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) 完成 GitHub + Vercel 首次 Deploy。

确保环境变量已配置：

- `DEEPSEEK_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 第 3 步：在 Vercel 绑定 emovalue.top

1. [vercel.com](https://vercel.com) → 进入项目 **emotion-ai-h5**
2. **Settings → Domains**
3. 输入 `emovalue.top` → **Add**
4. 再添加 `www.emovalue.top`（可选，建议跳转到主域名）

Vercel 会显示需要配置的 **DNS 记录**，例如：

| 类型 | 名称 | 值 |
|------|------|-----|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

（以 Vercel 页面**当前显示**为准，IP 可能更新。）

---

## 第 4 步：在域名注册商改 DNS

### 方案 A：Nameserver 交给 Vercel（最简单）

1. Vercel Domains 页选择 **Use Vercel DNS**
2. 复制 Vercel 提供的 **Nameservers**（两条）
3. 到买域名的地方 → **DNS / Nameserver** → 改为 Vercel 的 NS
4. 等待生效（通常 10 分钟～48 小时）
5. 回到 Vercel 点 **Refresh**，显示 **Valid** 即成功

### 方案 B：保留原 DNS，只加记录

在 Cloudflare / 阿里云 DNS 控制台手动添加 Vercel 提示的 `A` / `CNAME` 记录，保存后等待生效。

---

## 第 5 步：验证

浏览器打开：

- **https://emovalue.top** → 应打开情绪价值助手首页
- **https://www.emovalue.top** → 应跳转到主域名（若已配置）

手机 Safari / 微信内置浏览器各试一次。

---

## 推荐设置（可选）

在 Vercel **Domains** 中确认：

- **Redirect www → emovalue.top** 已开启
- **HTTPS** 自动启用（Vercel 免费证书）

---

## 分享用语示例

> 情绪价值 AI 助手，帮你写高情商回复和情感文案  
> https://emovalue.top

---

## 常见问题

**一直 Pending / Invalid Configuration**  
DNS 未生效，等 1～2 小时再 Refresh；检查记录是否填错主机名（`@` 表示根域名）。

**能打开 vercel.app 打不开 emovalue.top**  
说明部署正常，仅 DNS 未指到 Vercel，按第 4 步核对。

**微信里打不开**  
部分环境对境外域名有限制，需实测；长期国内推广可考虑备案 + 国内 CDN（后续再做）。
