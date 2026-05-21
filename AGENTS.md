# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 15 + React 19 + TypeScript mobile H5 app (AI short-video content operations assistant). It runs fully in **mock mode** without any external services configured.

### Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Test V1 flows | `npm run test:v1` |
| Test security | `npm run test:security` |
| Check env config | `npm run check:env` |

### Mock Mode (default, no env vars needed)

- **Login**: Use phone `13800138000` with code `1234` (admin). Any phone + code `1234` works for regular user.
- **AI generation**: Returns hardcoded mock content when `DEEPSEEK_API_KEY` is absent.
- **Payment**: Mock instant-paid simulation when `PAY_PROVIDER` is unset or `"mock"`.
- **Video generation**: Mock task simulation when `VIDEO_PROVIDER` is unset or `"mock"`.
- **Database**: Falls back to in-memory/local mock when Supabase env vars are absent.

### Important Notes

- The `.eslintrc.json` file at root is needed for `npm run lint` to work non-interactively. Without it, `next lint` prompts for interactive setup.
- The app uses the `NEXT_PUBLIC_BACKEND_MODE=server` env var to enable real server-side auth/orders. In default mode (no env var), auth is handled client-side with mock data.
- Admin access: phone numbers ending in `0000` get admin role (e.g., `13800138000`).
- All external integrations (DeepSeek, Supabase, Aliyun SMS, Alipay, Kling Video) are optional and gracefully degrade to mock implementations.
