# H5 + 微信小程序架构

同一套 Next.js 后端（`NEXT_PUBLIC_BACKEND_MODE=server`），H5 与小程序共用用户、额度、订单与热点数据。

## 架构

```
┌─────────────┐     ┌─────────────┐
│  H5 (Next)  │     │  miniprogram/ │
│  短信登录    │     │  wx.login     │
└──────┬──────┘     └──────┬──────┘
       │    Cookie / Bearer token
       └──────────┬──────────┘
                  ▼
         Next.js API (Supabase)
```

| 能力 | H5 | 小程序 |
|------|-----|--------|
| 登录 | 短信 `POST /api/auth/login` | `POST /api/auth/wechat/mini-login` |
| 会话 | `sv_session` Cookie | `Authorization: Bearer` + 可选 Cookie |
| 支付 | 支付宝 WAP / Mock | 微信 JSAPI（`PAY_PROVIDER=wechat`） |
| 热点 | 页面 `/hot-topics` | web-view 或原生页 |
| 推送 | 铃铛拉取广播 | 订阅消息 + 铃铛 |

---

## 一、热点 Cron + Push

### 定时刷新（已有）

- Vercel Cron：`vercel.json` → `GET /api/cron/refresh-hot-topics`（UTC 0:00 ≈ 北京 8:00）
- 备用：GitHub Actions `.github/workflows/daily-hot-topics.yml`（需配置 `CRON_SECRET`、`NEXT_PUBLIC_APP_URL`）

### 刷新后推送（新增）

Cron 成功后会：

1. 写入表 `push_broadcasts`（kind=`hot_topics_daily`）
2. H5 铃铛：`GET /api/v1/notifications/daily` 优先读广播
3. 若配置了订阅模板，向 `wechat_subscribe_logs` 中的 openid 发订阅消息

### 数据库迁移

在 Supabase 执行：

- `supabase/migrations/014_wechat_miniprogram_and_push.sql`

### 环境变量（订阅消息，可选）

```bash
WECHAT_MINI_APP_ID=
WECHAT_MINI_APP_SECRET=
# 公众平台 · 订阅消息 · 模板 ID（字段建议：thing1 标题 thing2 摘要 date3 日期）
WECHAT_SUBSCRIBE_HOT_TOPICS_TEMPLATE_ID=
```

### 本地验收 Cron + Push

```bash
# 鉴权探测
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/refresh-hot-topics?probe=1"

# 真实刷新（会写 push_broadcasts）
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/refresh-hot-topics?force=1"

# 读今日广播
curl "http://localhost:3000/api/v1/notifications/daily"
```

---

## 二、微信小程序

### 目录

`miniprogram/` — 用微信开发者工具打开此目录。

1. 修改 `project.config.json` 的 `appid`
2. 修改 `utils/config.js` 的 `API_BASE`（上线用 `https://www.emovalue.top`）
3. 配置服务器域名：request 合法域名指向你的 API 主机

### 登录流程

1. 小程序 `wx.login()` 取 `code`
2. `POST /api/auth/wechat/mini-login` `{ code }`
3. 保存返回的 `token`，后续请求带 `Authorization: Bearer <token>`

未绑手机号的用户 `mobile` 为 `mp_xxx`，可在 H5 或后续页调用：

`POST /api/auth/wechat/bind-mobile` `{ mobile, code }`（短信验证码）

### 订阅热点

首页「订阅每日热点提醒」→ `wx.requestSubscribeMessage` → `POST /api/wechat/subscribe`

### 支付

`.env`：

```bash
PAY_PROVIDER=wechat
WECHAT_MCH_ID=
WECHAT_API_V3_KEY=
WECHAT_MCH_SERIAL_NO=
WECHAT_MCH_PRIVATE_KEY=   # PEM
WECHAT_PAY_NOTIFY_URL=https://www.emovalue.top/api/pay/notify/wechat
```

小程序下单：

`POST /api/pay/create`  
Header: `X-Client-Channel: mini`  
Body: `{ "productName": "灵感包·50", "client": "mini" }`

返回 `wechatPayParams` → `wx.requestPayment`。

> 支付回调 `api/pay/notify/wechat` 需补全 APIv3 解密与验签后再上生产，见路由内 TODO。

---

## 三、与 H5 账号打通

推荐：**微信开放平台** 绑定小程序 + 公众号，使用 **unionid** 合并用户（表字段已预留 `unionid`）。

当前实现：

- 小程序先 `mini_openid` 建号
- 绑定手机号后与 H5 短信账号合并为同一 `users.id`

---

## 四、上线检查清单

- [ ] 执行 migration `014`
- [ ] `WECHAT_MINI_APP_ID` / `SECRET`
- [ ] 小程序 request 合法域名
- [ ] Cron：`CRON_SECRET`（Vercel + 可选 GitHub Secrets）
- [ ] 订阅模板 ID + 用户订阅
- [ ] 微信支付商户号与回调（生产）
- [ ] H5 继续：`NEXT_PUBLIC_BACKEND_MODE=server`
