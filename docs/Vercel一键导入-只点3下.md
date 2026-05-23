# Vercel 环境变量 — 一键导入

> 若 PowerShell 报红字「禁止运行脚本」，请用 **`scripts\打开Vercel一键导入.bat`**（双击即可）。

文件：`E:\emotion-ai-h5\docs\vercel-一键导入.env`

---

## 步骤（3 下）

### ① 双击运行（二选一）

- **推荐**：`scripts\打开Vercel一键导入.bat`（双击）
- 或不用脚本：用记事本打开 `docs\vercel-一键导入.env`

### ② Vercel 导入

1. https://vercel.com → 项目 **emotion-ai-h5-v2**
2. **Settings** → **Environment Variables**
3. **Import .env** 或 **Paste .env**
   - 上传文件：`vercel-一键导入.env`
   - 或 **Ctrl+V** 粘贴（bat 已复制到剪贴板）
4. 勾选 **Production、Preview、Development** → **Save**

### ③ Redeploy

**Deployments** → **⋯** → **Redeploy** → **Ready**

---

短域名与上传最新代码见：**`docs/绑定emotion.top-与上传上线.md`**（或双击 `scripts\一键上线-emotion.top.bat`）。

填完回我：**填好了**
