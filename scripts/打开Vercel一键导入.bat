@echo off
chcp 65001 >nul
set "ENVFILE=%~dp0..\docs\vercel-一键导入.env"
set "DOC=%~dp0..\docs\Vercel一键导入-只点3下.md"

echo.
echo ===== Vercel 一键导入 =====
echo.
echo 1. 已打开 Vercel 网站和说明文档
echo 2. 环境变量已复制到剪贴板（可在网页 Paste .env 里 Ctrl+V）
echo 3. 或 Import 时选择文件:
echo    %ENVFILE%
echo.

if exist "%ENVFILE%" (
  type "%ENVFILE%" | clip
  echo [OK] 已复制到剪贴板
) else (
  echo [错误] 找不到 env 文件
)

start "" "https://vercel.com/dashboard"
start "" "%DOC%"

echo.
pause
