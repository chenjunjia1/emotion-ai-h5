# AI 发布包 — 本地验收说明（2026-05-26）

## 一、环境自检结果

| 项目 | 状态 |
|------|------|
| `OPENAI_API_KEY` 已写入 `.env.local` | ✅ |
| `OPENAI_IMAGE_MODEL=dall-e-3` | ✅ |
| `DEEPSEEK_API_KEY` | ✅ |
| `NEXT_PUBLIC_BACKEND_MODE=server` | ✅ |
| `PEXELS_API_KEY` | ✅ 连通 |
| `npm run build` 生产构建 | ✅ 通过 |
| `npm run test:image-providers` → OpenAI | ⚠️ 本机 Node 直连 `api.openai.com` 失败（网络/需代理） |

> 若 OpenAI 自检失败：在能访问 OpenAI 的网络下（系统 VPN / 代理）再测。可在 `.env.local` 增加（按你的代理端口改）：
>
> ```env
> HTTPS_PROXY=http://127.0.0.1:7890
> HTTP_PROXY=http://127.0.0.1:7890
> ```
>
> 保存后重启 `npm run dev:quick`，再执行 `npm run test:image-providers`。

---

## 二、启动方式（二选一）

### 开发模式（推荐验收 UI）

```bash
cd e:\emotion-ai-h5
npm run dev:quick
```

打开：**http://localhost:3000/publish-pack**

### 生产模式（与线上一致）

```bash
cd e:\emotion-ai-h5
npm run build
npm start
```

同样访问：**http://localhost:3000/publish-pack**

---

## 三、验收清单

### 1. 页面与模式

- [ ] 顶部：AI发布包 Logo、灵感值、Pro、头像
- [ ] 两个 Tab：**快速出文案** / **高级图文包**
- [ ] 默认进入「快速出文案」

### 2. 快速出文案

- [ ] 输入一句话 → 点「先帮我出文案」
- [ ] 右侧：标题 5 条、正文 3 条、标签、基础爆款指数
- [ ] **无图片**
- [ ] 底部有「升级高级图文包」引导卡

### 3. 高级图文包

- [ ] 切换 Tab，可选 1 / 2 / 4 张图，价格 80 / 100 / 140 灵感（Pro 有折扣）
- [ ] 「让AI更懂你」标签可多选
- [ ] 「AI将这样生成图片」为中文描述
- [ ] 登录后点「生成高级图文包」→ 有封面图（OpenAI 可用时）或 Pexels/占位降级
- [ ] 可「补差价」升级到 4 张图

### 4. 其他

- [ ] 「让AI更懂我」扩写输入框，不自动生成
- [ ] 创作想法完整度进度条会随输入变化
- [ ] 灵感一下 / 换一批 可用

---

## 四、其他路由

| 地址 | 说明 |
|------|------|
| `/publish-pack` | 新版 V2（默认） |
| `/publish-pack?studio=1` | 旧工作室 |
| `/publish-pack?legacy=1` | 旧向导 |
| `/api/dev/image-providers` | 开发环境配图通道状态 |

---

## 五、构建产物

- 目录：`.next/`（`npm run build` 生成）
- 本包**未推送生产**，仅本地验收。
