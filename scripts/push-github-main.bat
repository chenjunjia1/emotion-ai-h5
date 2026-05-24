@echo off
chcp 65001 >nul
cd /d "e:\emotion-ai-h5"

where git >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 git，请确认 E 盘 Git 已加入系统 PATH，或重新打开终端。
  pause
  exit /b 1
)

echo 当前分支与最近一次提交：
git status -sb
git log -1 --oneline
echo.
echo 正在推送到 GitHub（会弹出浏览器登录，请用 chenjunjia1 账号授权）...
echo.

git fetch origin main
git push origin main

if errorlevel 1 (
  echo.
  echo [失败] 推送未完成。常见原因：未登录 GitHub 或 Token 无 repo 权限。
  echo 解决：在 GitHub - Settings - Developer settings 创建 PAT，勾选 repo，再执行：
  echo   git push https://你的TOKEN@github.com/chenjunjia1/emotion-ai-h5.git main --force-with-lease
  pause
  exit /b 1
)

echo.
echo [成功] 已推送到 origin/main，请到 Vercel 查看自动部署或手动 Redeploy。
pause
