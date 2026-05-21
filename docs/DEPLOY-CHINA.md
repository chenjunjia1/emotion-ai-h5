# 国内部署指南（给国内用户访问，不依赖翻墙）

你的项目有 **API 接口**（`/api/generate` 等），不能只当静态网页，需要 **Node.js 服务器** 跑 Next.js。

推荐路线：**阿里云轻量服务器 + 备案域名 emovalue.top**

---

## 整体架构（国内版）

```
用户手机
  → https://emovalue.top（已备案，解析到国内服务器 IP）
  → 阿里云轻量服务器（跑 npm run build && npm start）
  → DeepSeek API（国内可访问）
  → Supabase（国外，一般服务器能连；极慢再换国内数据库）
```

---

## 第一步：域名备案（必做，约 1～2 周）

已有 **emovalue.top** 在阿里云的话：

1. 阿里云控制台 → **ICP 备案** / **网站备案**
2. 按向导提交（个人：身份证 + 手机号）
3. 备案期间可用 **服务器 IP 临时访问**，正式域名需备案通过后才能用 `emovalue.top` 正常解析

> 没备案：国内用域名访问可能被拦或要求整改。

---

## 第二步：买国内服务器（轻量应用服务器）

1. 阿里云 → **轻量应用服务器**（Lighthouse）
2. 地域选 **华东 / 华南**（离用户近）
3. 镜像选 **Ubuntu 22.04** 或 **应用镜像 Node.js**（有的话）
4. 套餐：**2核2G** 左右即可跑 MVP（约 ¥50～80/月）
5. 记下 **公网 IP**，例如 `47.xxx.xxx.xxx`

安全组放行：**80、443、22** 端口。

---

## 第三步：服务器上安装环境

SSH 登录服务器后执行：

```bash
# Node.js 20（示例，用 nvm 或官方脚本均可）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2
```

---

## 第四步：上传代码并构建

**方式 A：Git（推荐）**

```bash
cd /var/www
git clone https://github.com/chenjunjia1/emotion-ai-h5.git
cd emotion-ai-h5
```

**方式 B：** 本机打包上传（不含 node_modules、.env.local）

在服务器：

```bash
npm install
npm run build
```

---

## 第五步：配置环境变量

在服务器项目根目录创建 `.env.production` 或 `.env.local`：

```env
DEEPSEEK_API_KEY=sk-你的key
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 第六步：用 PM2 常驻运行（不用一直开你电脑）

```bash
cd /var/www/emotion-ai-h5
pm2 start npm --name "emotion-ai" -- start
pm2 save
pm2 startup
```

网站会在服务器 **24 小时运行**，关你电脑不影响。

---

## 第七步：Nginx + HTTPS（用域名访问）

1. 安装 Nginx，`apt install nginx`
2. 配置反向代理到 `http://127.0.0.1:3000`
3. 阿里云 **免费 SSL 证书** 绑 `emovalue.top` / `www.emovalue.top`
4. 域名解析：**A 记录 @ 和 www → 服务器公网 IP**（不再是 Vercel IP）

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name emovalue.top www.emovalue.top;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 第八步：和 Vercel 的关系

| 项目 | 建议 |
|------|------|
| Vercel | 可保留作备份 / 海外访问 |
| 国内主站 | **emovalue.top → 国内服务器 IP** |
| DNS | 把原来指向 Vercel 的 A/CNAME **改成服务器 IP** |

---

## 更简单但需学习的替代

| 平台 | 特点 |
|------|------|
| **腾讯云 Web 应用托管 / 云开发** | 有 Node 托管，按文档部署 Next |
| **Sealos / 宝塔面板** | 可视化部署 Node 项目 |
| **纯静态 CDN** | ❌ 不适合本项目（有 API） |

---

## Supabase 说明

- 服务器在国内 **调用** Supabase 一般可以
- 若极慢或失败，再考虑：**阿里云 RDS / PolarDB** + 自建表（迁移 SQL 可复用）

DeepSeek 在国内 **无问题**。

---

## 成本粗算（月）

| 项目 | 约 |
|------|-----|
| 轻量服务器 | ¥50～80 |
| 域名 emovalue.top | 已买 |
| 备案 | 免费 |
| DeepSeek | 按量 |
| Supabase 免费档 | $0 |

---

## 建议执行顺序

1. 提交 **emovalue.top 备案**（并行进行）
2. 买 **轻量服务器**
3. 服务器部署 + PM2
4. 备案通过后，DNS 指到服务器 + HTTPS
5. 手机用 **https://emovalue.top** 测试

需要我根据你买的具体阿里云产品写 **一步一步 SSH 命令版**，可以说一下你准备用「轻量服务器」还是「还没买」。
