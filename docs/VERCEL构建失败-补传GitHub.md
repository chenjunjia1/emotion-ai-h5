# Vercel 构建失败：Module not found — 修复步骤

## 原因（你已遇到）

1. **GitHub 上的代码不完整**：本地能 `npm run build` 通过，但 `github.com/chenjunjia1/emotion-ai-h5` 的 `main` 分支**少了很多文件**。
2. **仓库里多了一套旧的 `app/` 目录**（根目录下），和正确的 `src/app/` **重复**。Vercel 会编译根目录 `app/api/...`，里面引用了不存在的 `@/lib/server/db/generations` 等。

报错里出现的：

- `@/components/modals/invite-friends-modal` — GitHub **没有**这个文件，但旧版 `home-cream-carousel.tsx` 引用了它
- `@/lib/server/db/generations`、`growth` — GitHub **没有**这两个文件

---

## 正确做法（推荐，一次搞定）

### 第 1 步：在 GitHub 网页删除根目录 `app/` 文件夹

1. 打开 https://github.com/chenjunjia1/emotion-ai-h5  
2. 若能看到根目录下有 **`app`** 文件夹（与 `src` 同级）→ 点进去 → 右上角 **⋯** → **Delete directory**  
3. 只删 **`app/`**，不要删 **`src/app/`**

> 本地项目只有 `src/app/`，没有根目录 `app/`，删 GitHub 上的 `app/` 是对的。

### 第 2 步：把本地完整代码推到 GitHub

在 **Cursor 终端** 或 **Git Bash**（需已安装 Git）：

```bash
cd e:\emotion-ai-h5

git add src supabase scripts vercel.json package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts public docs

git status
# 应看到大量新增/修改，尤其：
#   src/lib/server/db/generations.ts
#   src/lib/server/db/growth.ts
#   src/lib/server/defer-generation-side-effects.ts
#   src/components/modals/invite-friends-modal.tsx
#   src/components/pricing/quota-pack-pricing.tsx
#   supabase/migrations/007_*.sql
#   supabase/migrations/008_*.sql

git commit -m "fix: 补全 server/db、modals 与上线改动，修复 Vercel 构建"

git push origin main
```

没有装 Git 时：用 **GitHub Desktop** 打开 `e:\emotion-ai-h5` → 全选变更 → Commit → Push。

### 第 3 步：Vercel 重新部署

1. Vercel → **emotion-ai-h5-v2** → **Deployments**  
2. 等 GitHub 推送触发自动部署，或手动 **Redeploy**  
3. 构建日志应出现 `Compiled successfully`，不再 `Module not found`

---

## 若暂时不能删 `app/`，至少要补这些文件到 GitHub

在 GitHub 网页 **Add file → Upload files**，从本地上传：

| 本地路径 |
|----------|
| `src/components/modals/invite-friends-modal.tsx` |
| `src/lib/server/db/generations.ts` |
| `src/lib/server/db/growth.ts` |
| `src/lib/server/db/invite-blind-box.ts` |
| `src/lib/server/defer-generation-side-effects.ts` |
| `src/lib/server/admin.ts`（若 GitHub 上是旧版可覆盖） |

并更新 `src/components/home/home-cream-carousel.tsx` 为本地最新版（可不引用 invite-friends-modal）。

仍建议尽快 **删除根目录 `app/`**，否则以后还会踩坑。

---

## 自检：GitHub 上是否齐全

浏览器打开（能打开说明文件存在）：

- https://github.com/chenjunjia1/emotion-ai-h5/blob/main/src/lib/server/db/generations.ts  
- https://github.com/chenjunjia1/emotion-ai-h5/blob/main/src/lib/server/db/growth.ts  
- https://github.com/chenjunjia1/emotion-ai-h5/blob/main/src/components/modals/invite-friends-modal.tsx  

三个都是 **200 页面** 即 OK。

---

## 本地已验证

在 `e:\emotion-ai-h5` 执行 `npm run build` **已通过**。  
Vercel 失败 = **GitHub 代码与本地不一致**，不是业务逻辑坏了。
