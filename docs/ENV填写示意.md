# .env.local 填写对照（避免填错）

在 Supabase 项目里：**Settings（齿轮）→ API**

```
┌─────────────────────────────────────────────────────────┐
│  Project URL                                            │
│  https://jusmmzzfnrilnswzjiad.supabase.co    ← 复制这个 │
│  写入: NEXT_PUBLIC_SUPABASE_URL                         │
│  ❌ 不要带 /rest/v1/                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Project API keys                                       │
│                                                         │
│  anon  public    eyJhbGciOiJIUzI1NiIs...    ← 复制这个   │
│  写入: NEXT_PUBLIC_SUPABASE_ANON_KEY                    │
│                                                         │
│  service_role    eyJhbGciOiJIUzI1NiIs...    ← 点 Reveal  │
│  写入: SUPABASE_SERVICE_ROLE_KEY                        │
│                                                         │
│  ❌ 不要填 REST 文档里的 Request URL                      │
│  ❌ 不要填 https://xxx.supabase.co/rest/v1/            │
└─────────────────────────────────────────────────────────┘
```

DeepSeek：`DEEPSEEK_API_KEY=sk-` 后面是一长串，不是网址。
