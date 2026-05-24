@echo off
chcp 65001 >nul
set "ROOT=%~dp0.."
cd /d "%ROOT%"

echo.
echo ===== Vercel 环境变量一键粘贴 =====
echo.

node scripts\copy-vercel-env.mjs
if errorlevel 1 (
  pause
  exit /b 1
)

if exist "%ROOT%\.env.vercel-paste" (
  type "%ROOT%\.env.vercel-paste" | clip
  echo [OK] 环境变量已复制到剪贴板
  echo.
  echo 请在 Vercel 页面:
  echo   1. Settings -^> Environment Variables
  echo   2. 点 Paste .env 或 Import
  echo   3. Ctrl+V 粘贴 -^> Save
  echo   4. 把 ADMIN_MOBILES 改成你的真实手机号
  echo   5. Deployments -^> ... -^> Redeploy
  echo.
) else (
  echo [错误] 未生成 .env.vercel-paste
  pause
  exit /b 1
)

start https://vercel.com/chenjunjia1/emotion-ai-h5-v2/settings/environment-variables
start https://vercel.com/chenjunjia1/emotion-ai-h5-v2/deployments
start "" "%ROOT%\docs\Vercel一键导入-只点3下.md"

pause
