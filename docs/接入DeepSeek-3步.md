# 接入 DeepSeek 真 AI（3 步）

代码已写好：有有效 `DEEPSEEK_API_KEY` 时走真模型，没有或失败时自动用 Mock 演示数据。

---

## 第 1 步：拿 API Key（约 5 分钟）

1. 打开 **https://platform.deepseek.com**
2. 注册 / 登录
3. 左侧 **API Keys** → **创建 API Key**
4. 复制以 **`sk-`** 开头的整串（只显示一次，请保存）
5. **充值**一点余额（新账号常有赠送；不足会返回 402）

---

## 第 2 步：填到本机 + Vercel

### 本机 `.env.local`

打开 `E:\emotion-ai-h5\.env.local`，把第一行改成你的真 key：

```env
DEEPSEEK_API_KEY=sk-你的完整密钥
```

不要用 `sk-your-deepseek-key` 这种占位符。

### Vercel（线上必做）

1. **https://vercel.com** → 项目 **emotion-ai-h5**
2. **Settings → Environment Variables**
3. 新增一条：
   - **Name:** `DEEPSEEK_API_KEY`
   - **Value:** `sk-你的完整密钥`（与本地相同）
   - 勾选 **Production、Preview、Development**
4. **Save**
5. **Deployments → ⋯ → Redeploy**（改环境变量后必须重新部署）

可选（一般不用改）：

```env
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com
```

---

## 第 3 步：测试

### 本机

```bat
cd E:\emotion-ai-h5
npm run test:deepseek
```

看到 **✅ DeepSeek API 连接成功** 即可。

再 `npm run dev`，登录后试 **选题盲盒 / 发布包 / 标题扭蛋**，文案应每次不同（不是固定 Mock）。

### 线上

1. Redeploy **Ready** 后
2. 无痕打开 **https://www.emovalue.top**
3. 登录 → 抽选题或生成发布包 → 看内容是否明显更「像真人写的」

---

## 哪些功能会走 DeepSeek？

| 功能 | API |
|------|-----|
| 选题盲盒 | `POST /api/v1/topic-box` |
| 发布包 | `POST /api/v1/generate/publish-pack` |
| 标题扭蛋 | `POST /api/v1/title-gacha` |
| 账号方案 / 今日视频 / 爆款同款 | `/api/v1/generate/account` 等 |

均需：**已登录 + 有额度 + 有效 DEEPSEEK_API_KEY**。

---

## 常见问题

| 现象 | 处理 |
|------|------|
| 还是像假文案 | Vercel 是否 Redeploy；key 是否占位符 |
| HTTP 402 | DeepSeek 控制台充值 |
| HTTP 401 | key 复制错或已删除，重新创建 |
| 本地 OK、线上 Mock | 只改了 `.env.local`，忘了 Vercel 变量 + Redeploy |

---

**注意：** 不要把 `sk-` 密钥提交到 GitHub 或发在群里。只放在 `.env.local` 和 Vercel 环境变量里。
