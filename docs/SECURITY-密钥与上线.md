# 密钥安全与上线注意

1. **切勿**将 `SUPABASE_SERVICE_ROLE_KEY`、`SESSION_SECRET`、短信/支付私钥提交到 Git。
2. `docs/vercel-一键导入.env` 仅为占位模板；若曾泄露真实密钥，请在 Supabase 控制台 **轮换 service_role**，并更换 `SESSION_SECRET`。
3. 管理员访问 `/admin` 需在 Vercel 配置 `ADMIN_MOBILES=你的手机号`（逗号分隔），不再使用「手机号尾号 0000」自动提权。
4. 数据库迁移请执行至 `008_launch_readiness.sql`（见 `PRODUCTION-运营上线清单.md`）。
