# 安全说明与已修复项

## 已实施防护

| 类别 | 措施 |
|------|------|
| 限流 | 全站 `/api/*` 按 IP 限流；生成/事件/历史分接口限流 |
| AI 并发 | 单实例最多 `AI_MAX_CONCURRENT`（默认 20）路并行 DeepSeek |
| 请求体 | JSON 最大 32KB（生成）/ 16KB（事件） |
| Session | `x-session-id` 仅允许 8–64 位字母数字 `_-` |
| SSRF | `DEEPSEEK_API_URL` 仅允许白名单 https 域名 |
| 错误信息 | 生产环境不向用户返回上游 API 原始错误 |
| 响应头 | `X-Frame-Options`、CSP（生产）、HSTS（生产） |
| 事件枚举 | `/api/events` 仅允许白名单 event 类型 |
| Payload | 埋点 payload 最大 8KB，超出截断 |

## 已知限制（V1）

1. **登录/会员/支付** 在浏览器 `localStorage`，可被用户篡改；正式上线须改为服务端会话 + 鉴权 API。
2. **Admin 页** 仅前端判断手机号，无服务端权限，不可用于真实运营后台。
3. **进程内限流** 多实例部署时每台机器独立计数，须配合 Nginx / Redis 全局限流。
4. **Supabase** 使用 `service_role` 仅在服务端；切勿写入 `NEXT_PUBLIC_*` 或前端代码。

## 环境变量（禁止泄露）

- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`

仅配置在服务器 `.env.local` / 平台环境变量，勿提交 Git。

## 上线前检查清单

- [ ] 关闭生产环境详细错误栈
- [ ] 配置 Nginx `limit_req`（见 DEPLOY-100-CONCURRENT.md）
- [ ] Supabase 启用 RLS，禁止 anon 直连敏感表
- [ ] 轮换所有 API Key
- [ ] 备案域名 HTTPS 强制跳转
