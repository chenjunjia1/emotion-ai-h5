# 为什么 Vercel 变量填了还是 Mock 1234？

**原因：** Vercel 环境变量已生效，但 **GitHub 上的代码还是旧版**，没有：
- `/api/auth/send-code` 等接口
- `NEXT_PUBLIC_BACKEND_MODE=server` 的前端逻辑

必须把 **本机 `E:\emotion-ai-h5`** 最新代码再传到 GitHub，Vercel 才会自动部署新版。

---

## 上传方式（GitHub 网页，和上次改 types.ts 一样）

打开：https://github.com/chenjunjia1/emotion-ai-h5

### 需要更新/新增的文件夹（整文件夹上传）

在 GitHub 点 **Add file → Upload files**，从本机拖入：

| 本机路径 | 说明 |
|----------|------|
| `src/app/api/auth/` | 登录接口（整个文件夹） |
| `src/app/api/me/` | 用户信息 |
| `src/app/api/pay/` | 支付 |
| `src/app/api/v1/` | 文案生成 |
| `src/lib/server/` | 服务端逻辑（整个文件夹） |
| `src/lib/client/` | 前端调 API |
| `src/contexts/app-context.tsx` | 已改 server 模式 |
| `src/lib/ai/v1-deepseek.ts` | DeepSeek 文案 |

若 GitHub 上还没有这些目录，直接上传整个 **`src`** 文件夹最省事（覆盖旧文件）。

可选一并上传：
- `src/middleware.ts`（若有）
- `docs/`（文档，可选）

### Commit 说明

```
feat: 服务端登录/支付/Supabase 真运营
```

上传后等 Vercel **Deployments** 自动出现新的一条 → **Ready**。

---

## 上传成功后，登录应变成

- 不再固定提示「Mock: 1234」为主流程（dev 短信验证码在 Vercel Logs 里看 6 位数）
- 或至少：获取验证码会请求 `/api/auth/send-code`

---

## 上传前本地可先测（可选）

```bat
cd E:\emotion-ai-h5
npm run dev
```

浏览器 http://localhost:3000 → 登录测试。
