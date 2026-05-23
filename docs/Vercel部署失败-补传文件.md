# Vercel 部署失败：Module not found 怎么办

## 原因（不是代码写错了）

本地 `npm run build` **能通过**，说明项目没问题。

### 最常见根因：页面传错目录

旧版分批脚本 `batch-app.zip` 解压后是 **`app` 文件夹**（没有 `src` 前缀）。若上传到 **仓库根目录**，会出现：

| 路径 | 实际内容 | Next.js 是否使用 |
|------|----------|------------------|
| `/app/page.tsx` | 新版（邀请卡片、新创作页） | **否** |
| `/src/app/page.tsx` | 旧版（home-sections） | **是** → 线上跑这个 |

所以会出现：**组件补全了仍 Error**，或 **构建过了但线上仍是旧首页**。

**必须先删除仓库根目录的 `app` 文件夹**（不是 `src/app`），再把本机 `src/app` 上传到 `src/app`。

运行 `node scripts/pack-src-app-for-github.mjs` 可生成 `github-upload-src-app.zip`。

---

GitHub 上还可能是**分批不完整**：

| 已上传 | 未上传（缺这些才会报错） |
|--------|-------------------------|
| 根目录误传的 `app/` | 应删；正确位置是 `src/app/` |
| `src/components/play/` 等 | 缺则 Module not found |
| `src/lib/ai/normalize-ai-result.ts` 等 | 缺则 Module not found |

报错里的路径例如：

- `@/components/play/workshop-tabs`
- `@/components/home/home-invite-promo`
- `@/components/pricing/membership-pricing`
- `@/lib/ai/normalize-ai-result`

都是 **GitHub 仓库里没有这个文件**，不是 Vercel 配置问题。

---

## 修复（推荐，约 5 分钟）

### 方法 A：补传缺失包（最小改动）

1. 在本机找到并解压：**`E:\emotion-ai-h5\github-upload-missing.zip`**  
   （若没有，在项目目录运行：`node scripts/pack-missing-for-github.mjs`）
2. 打开 https://github.com/chenjunjia1/emotion-ai-h5 → 进入 **`src`**
3. **Add file → Upload files**
4. 把解压出来的 **`components`**、**`lib`**、**`hooks`** 文件夹拖进去（与现有目录**合并**，不要只传单个文件）
5. Commit 说明：

```
fix: 补全 play/pricing/home 组件与 lib 依赖
```

6. Vercel → Deployments → 等新的构建 **Ready**

### 方法 B：整包覆盖 src（最稳）

1. 解压 **`emotion-ai-h5-上传GitHub.zip`**（或运行 `scripts\打包上传GitHub.bat` 重新生成）
2. GitHub → `src` → Upload files → 拖入完整 **`src`** 文件夹覆盖
3. Commit：`fix: 同步完整 src 与本地一致`

---

## 上传后自检

在 GitHub 网页确认这些路径**存在**：

- `src/components/play/workshop-tabs.tsx`
- `src/components/pricing/membership-pricing.tsx`
- `src/components/home/home-invite-promo.tsx`
- `src/components/home/home-play-entries.tsx`
- `src/lib/ai/normalize-ai-result.ts`

然后 Vercel 重新部署应显示 **Ready**。

---

## 两个 Vercel 项目

你同时有 **emotion-ai-h5** 和 **emotion-ai-h5-v2**，建议只保留一个连 GitHub，避免搞混。线上用 **Production = Ready** 的那条部署。

做完回复 **补传好了**，或发新 Build Log。
