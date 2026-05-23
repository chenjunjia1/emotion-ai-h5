# 绑定 emotion.top + 线上更新为最新 V1

> 电脑需登录 **Vercel**、**GitHub**、**域名控制台**（阿里云等）。  
> 双击 **`scripts\一键上线-emotion.top.bat`** 会帮你打开页面并复制环境变量。

---

## 一、绑定短域名 emotion.top（约 5 分钟）

### 1. Vercel 添加域名

1. 打开 https://vercel.com → 项目 **emotion-ai-h5-v2**
2. **Settings** → **Domains**
3. 输入 **`emotion.top`** → **Add**
4. 再输入 **`www.emotion.top`** → **Add**（建议勾选跳转到 `emotion.top`）

页面会显示要填的 DNS（以 Vercel 当前显示为准，常见如下）：

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

### 2. 在买域名的地方改 DNS（阿里云示例）

1. 阿里云 → **域名** → **域名列表** → 点 **emotion.top** → **解析设置**
2. 添加上表两条记录（若已有冲突的旧 A/CNAME，先删掉再添加）
3. 保存，等 **10 分钟～2 小时**
4. 回到 Vercel Domains 点 **Refresh**，状态变为 **Valid** 即可

> 若 Vercel 提供 **Use Vercel DNS**，也可把域名的 Nameserver 改成 Vercel 给的两条 NS（更省事）。

### 3. 验证

浏览器打开 **https://emotion.top**，应能打开网站（和 v2.vercel.app 同一套）。

---

## 二、Vercel 环境变量改为短链（约 2 分钟）

1. **Settings** → **Environment Variables**
2. 双击 **`scripts\打开Vercel一键导入.bat`**（已含 `emotion.top` 相关变量）
3. 网页 **Paste .env** 或 **Import** → 选 `docs\vercel-一键导入.env`
4. 勾选 **Production / Preview / Development** → **Save**
5. 若有旧的 `NEXT_PUBLIC_APP_URL`（vercel.app），改成 `https://emotion.top` 或删除后重新导入

---

## 三、上传最新代码到 GitHub（约 5 分钟）

本机已生成压缩包：**`E:\emotion-ai-h5\emotion-ai-h5-上传GitHub.zip`**

1. 打开 https://github.com/chenjunjia1/emotion-ai-h5
2. 解压 zip，进入 **`src`** 文件夹
3. GitHub 仓库里进入 **`src`** 目录 → **Add file** → **Upload files**
4. 把解压后的 **`src` 整个文件夹**拖进去
5. Commit message：`feat: V1 首页与四核心功能`
6. **Commit changes**

---

## 四、等 Vercel 自动部署

1. **Deployments** 出现新的一条
2. 等 **Building → Ready**（约 2～5 分钟）
3. 若无新部署：点 **⋯** → **Redeploy**

---

## 五、验收（无痕窗口）

| 检查项 | 期望 |
|--------|------|
| https://emotion.top | 首页标题含「**不会写短视频**」（V1 文案） |
| 底部导航 | 首页 / 创作 / 复盘 / 素材库 / 我的 |
| 登录 | 获取验证码有 60 秒倒计时 |

---

## 常见问题

**emotion.top 打不开**  
DNS 未生效或未在阿里云添加 A 记录；用 https://dnschecker.org 查 `emotion.top` 是否指向 `76.76.21.21`。

**短链能开，内容还是旧版**  
GitHub 未上传最新 `src`，或 Vercel 未 Redeploy。

**只有 vercel.app 能开**  
域名还没在 Vercel 里 Valid，继续等 DNS 或核对解析记录。

---

做完回我：**绑好了** 或发 Vercel Domains 截图。
