# 支撑约 100 并发用户部署指南

## 架构说明

当前 V1 **主流程在浏览器端**（Mock 登录/支付/生成），服务器压力主要来自：

- 静态页面（Next.js）
- 可选 API：`/api/generate`、`/api/events`、`/api/history`

100 并发 ≈ 100 人同时在线，峰值请求约 **50–200 req/min**（视是否调用 AI API）。

## 推荐部署（国内轻量 2C2G）

### 1. 进程数（PM2 集群）

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

`ecosystem.config.cjs` 默认 `instances: 2`（按 CPU 核数调整），可分担静态页与 API。

### 2. Nginx 全局限流（必配，多实例时替代进程内限流）

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;

server {
    location /api/ {
        limit_req zone=api burst=60 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        limit_req zone=general burst=100 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 3. 环境变量（`.env.local`）

```env
# 限流（单实例进程内，可与 Nginx 叠加）
API_RATE_LIMIT_PER_IP=120
GENERATE_RATE_LIMIT_PER_IP=15
GENERATE_RATE_LIMIT_PER_SESSION=10
EVENTS_RATE_LIMIT_PER_IP=60
HISTORY_RATE_LIMIT_PER_IP=30

# AI 并发上限（保护 DeepSeek 额度与内存）
AI_MAX_CONCURRENT=20
```

### 4. 数据库

在 Supabase 执行 `004_performance_indexes.sql`。

连接池：Supabase 托管自带；自托管 Postgres 建议 `max_connections >= 100`。

### 5. 容量粗算

| 资源 | 2C2G 轻量 | 说明 |
|------|-----------|------|
| 静态 H5 | ✅ 100 并发 | CDN/Nginx 缓存更佳 |
| API 生成 | ⚠️ 建议 ≤20 并行 AI | 由 `AI_MAX_CONCURRENT` 控制 |
| 纯浏览/本地 Mock | ✅ | 几乎不占 CPU |

若 **大量用户同时点「生成」且走服务端 DeepSeek**，建议升级到 **4C4G** 或接入队列（Redis + Worker）。

## 压测命令示例

```bash
# 需安装 hey: go install github.com/rakyll/hey@latest
hey -n 1000 -c 100 -m GET https://你的域名/
```

首页应大部分 200；`/api/generate` 在超额时返回 429/503。

## 正式上线清单

1. 会员/登录/支付迁到服务端 API + JWT
2. Redis 全局限流 + 会话
3. WAF（阿里云免费基础版）
4. 日志与告警（5xx、429 比例）
