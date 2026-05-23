Auto-run# 上传 GitHub → Vercel 自动部署（5 步，约 10 分钟）

> 我**不能**替你登录 GitHub，但已帮你打好压缩包，你只需上传。

---

## 第 0 步：生成压缩包（1 次）

双击运行：

```
E:\emotion-ai-h5\scripts\打包上传GitHub.bat
```

会在项目里生成：

**`E:\emotion-ai-h5\emotion-ai-h5-上传GitHub.zip`**

（里面是整个 `src` + 配置文件，**没有** `.env.local` 密钥，安全。）

---

## 第 1 步：打开 GitHub 仓库

浏览器打开：

https://github.com/chenjunjia1/emotion-ai-h5

确认已登录你的账号。

---

## 第 2 步：上传压缩包里的内容

### 方法 A（推荐）：只更新 src 文件夹

1. 在电脑上**右键 zip → 解压到当前文件夹**
2. 打开解压后的文件夹，确认有 **`src`** 文件夹
3. 在 GitHub 网页，点进 **`src`** 目录（若已有）
4. 点 **Add file** → **Upload files**
5. 把解压出来的 **`src` 整个文件夹**拖进网页（或选中 src 里所有文件拖进去）
6. 页面拉到最下：
   - Commit message 填：`feat: 真登录 Supabase + 验证码60秒倒计时`
   - 点绿色 **Commit changes**

> 若提示文件很多，等它传完（可能 1～3 分钟）。

### 方法 B：整个项目替换（zip 里全部拖入根目录）

若方法 A 太麻烦：

1. 在 GitHub 仓库根目录 **Add file → Upload files**
2. 把 zip 解压后的 **所有文件和文件夹**（src、package.json 等）拖进去
3. Commit：`feat: 更新全站代码`

---

## 第 3 步：等 Vercel 自动部署

1. 打开 https://vercel.com → **emotion-ai-h5-v2**
2. 点 **Deployments**
3. 会出现一条新的，状态从 Building → **Ready**（约 2～5 分钟）

---

## 第 4 步：测试

1. 用**无痕窗口**打开网站（避免旧缓存）
2. 登录 → **获取验证码**
3. 按钮应显示 **60秒后重发** 倒计时
4. 若环境变量已配好：Vercel **Logs** 里有 6 位验证码（不是固定 Mock 提示为主流程）

---

## 常见问题

| 问题 | 处理 |
|------|------|
| GitHub 上传失败/太大 | 只上传 `src` 文件夹（方法 A） |
| Vercel 部署 Error | 把 Build Log 最后 10 行发我 |
| 还是 Mock 1234 | 确认 Deployment 是最新 commit，且变量 `NEXT_PUBLIC_BACKEND_MODE=server` |

---

做完回我：**上传好了** 或发 Vercel 部署截图。
