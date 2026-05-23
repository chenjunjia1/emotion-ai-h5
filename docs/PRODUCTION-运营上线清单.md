# 真运营上线清单（赚钱版）

当前线上 **V1 演示版** 可点全流程；要 **收真钱、真用户、真 AI**，按下面顺序做。每项都写了「你要准备什么」和「代码里对应什么」。

---

## 总览：5 大块 + 建议顺序

| 顺序 | 模块 | 你要办的事（平台账号） | 代码状态 |
|------|------|------------------------|----------|
| 1 | **Supabase 数据库** | 注册 Supabase，执行 SQL | 迁移脚本已备好 `supabase/migrations/002~004` |
| 2 | **手机号登录** | 阿里云/腾讯云 **短信** | 已加 `/api/auth/*`，配好密钥即真发短信 |
| 3 | **DeepSeek 文案** | DeepSeek 开放平台 API Key | 已加 `/api/v1/generate/*`，配 `DEEPSEEK_API_KEY` |
| 4 | **支付宝收款** | **企业/个体户** + 支付宝开放平台商户 | 已加 `/api/pay/*` 骨架，填商户密钥后接回调 |
| 5 | **AI 成片** | 选一家：可灵 / 即梦 / HeyGen 等 | 已加 `video` 服务接口，填 `VIDEO_PROVIDER_*` |

**不建议** 长期用「个人收款码 + 点 Mock 支付成功」——无法防作弊、无法对账。

---

## 第 1 步：Supabase（必做，1～2 小时）

1. 打开 https://supabase.com → New Project  
2. **Settings → API** 复制：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（仅 Vercel/服务器，勿泄露）
3. **SQL Editor** 依次执行（**必须全部执行到 008**）：
   - `supabase/migrations/001_initial.sql`
   - `002_v1_schema.sql`
   - `003_support_feedbacks.sql`
   - `004_performance_indexes.sql`
   - `005_v1_product_invite_growth.sql`
   - `006_fix_generations_and_invite.sql`
   - `007_daily_inspiration_titles.sql`
   - `008_launch_readiness.sql`
4. Vercel 项目 **Environment Variables** 填上述 3 个 + 下面会话密钥：

```env
SESSION_SECRET=随机32位以上字符串
NEXT_PUBLIC_BACKEND_MODE=server
```

5. Redeploy。用户/订单/历史从 **localStorage** 迁到 **Postgres**。

---

## 第 2 步：真短信登录（1～3 天，含审核）

### 阿里云短信（示例）

1. 开通阿里云 → 短信服务 → 申请签名、模板（验证码类）  
2. 环境变量：

```env
SMS_PROVIDER=aliyun
ALIYUN_SMS_ACCESS_KEY_ID=
ALIYUN_SMS_ACCESS_KEY_SECRET=
ALIYUN_SMS_SIGN_NAME=
ALIYUN_SMS_TEMPLATE_CODE=
```

3. 未配置时：`SMS_PROVIDER=dev` 仅开发用（验证码打在服务端日志，**不能上线**）

### 接口

- `POST /api/auth/send-code` `{ "mobile": "138..." }`
- `POST /api/auth/login` `{ "mobile", "code" }` → 设置 HttpOnly Cookie
- `GET /api/me` → 当前用户
- `POST /api/auth/logout`

前端：设置 `NEXT_PUBLIC_BACKEND_MODE=server` 后，登录弹窗走上述接口。

---

## 第 3 步：DeepSeek 真文案（约 30 分钟）

1. https://platform.deepseek.com 充值并创建 API Key  
2. Vercel 添加：

```env
DEEPSEEK_API_KEY=sk-...
```

3. 起号 / 今日视频 / 爆款同款 走：

- `POST /api/v1/generate/account`
- `POST /api/v1/generate/daily`
- `POST /api/v1/generate/viral`

服务端：风控 → 扣额度（数据库）→ 调 DeepSeek → 存 `generations` 表。

**成本**：按 token 计费，建议 Pro 会员定价覆盖 API 成本。

---

## 第 4 步：支付宝（3～7 天，含商户审核）

### 需要

- 营业执照或个体户  
- 支付宝开放平台 → 创建应用 → 签约 **手机网站支付** 或 **当面付**  
- 配置 **异步通知 URL**：`https://你的域名/api/pay/notify/alipay`

### 环境变量

```env
PAY_PROVIDER=alipay
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=   # 应用私钥，一行或 PEM
ALIPAY_PUBLIC_KEY=    # 支付宝公钥
ALIPAY_NOTIFY_URL=https://emotion-ai-h5-v2.vercel.app/api/pay/notify/alipay
```

### 流程

1. 用户点购买 → `POST /api/pay/create` 创建 `orders` 表记录  
2. 返回支付宝跳转 URL / 表单  
3. 用户付款 → 支付宝 POST 通知 → 验签 → `benefit_granted=true` 发会员/视频币  

`PAY_PROVIDER=mock` 时仍为演示按钮（仅开发）。

---

## 第 5 步：AI 成片 / 数字人（按厂商 3～10 天）

1. 选定厂商并签约 API  
2. 配置例如：

```env
VIDEO_PROVIDER=kling   # mock | kling | custom
KLING_API_KEY=
KLING_API_BASE=
```

3. `POST /api/v1/video/create` 创建任务 → 厂商回调 `/api/v1/video/webhook` → 更新 `video_tasks`、扣/退视频币  

当前演示仍是 `mock.mp4`；填厂商密钥后切换实现。

---

## 合规与运营（别跳过）

| 事项 | 说明 |
|------|------|
| ICP 备案 | 国内域名长期运营建议备案 |
| 用户协议 / 隐私政策 | 已有页面，支付前需用户勾选 |
| 退款规则 | 《会员与视频币规则》需与真实支付一致 |
| 客服 | 微信 `jia9785361` 已写在支持页，订单纠纷要有处理流程 |

---

## Vercel 环境变量完整清单

```env
# 必做
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_BACKEND_MODE=server

# AI
DEEPSEEK_API_KEY=

# 短信（上线）
SMS_PROVIDER=aliyun
ALIYUN_SMS_ACCESS_KEY_ID=
ALIYUN_SMS_ACCESS_KEY_SECRET=
ALIYUN_SMS_SIGN_NAME=
ALIYUN_SMS_TEMPLATE_CODE=

# 支付（上线）
PAY_PROVIDER=alipay
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_NOTIFY_URL=

# 视频（上线）
VIDEO_PROVIDER=kling
KLING_API_KEY=
```

---

## 你怎么推进（建议）

1. **本周**：Supabase + `SESSION_SECRET` + `BACKEND_MODE=server` → 用户数据上云  
2. **下周**：DeepSeek + 短信（或先短信 dev 内测）  
3. **有商户后**：支付宝回调  
4. **有预算后**：视频 API  

每完成一步在 GitHub Commit，Vercel 自动部署。需要我代写某一厂商的具体对接时，把 **开放平台文档链接** 和 **已开通的产品** 发我即可。
