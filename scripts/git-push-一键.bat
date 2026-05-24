@echo off
chcp 65001 >nul
set "GIT=%ProgramFiles%\Git\cmd\git.exe"
if not exist "%GIT%" for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\GitForWindows" /v InstallPath 2^>nul') do set "GIT=%%b\cmd\git.exe"
if not exist "%GIT%" (
  echo [错误] 未找到 Git，请确认已安装 Git for Windows
  pause
  exit /b 1
)

cd /d "e:\emotion-ai-h5"
echo ===== Git 推送到 GitHub =====
echo.

REM 国内常见：Clash / V2Ray 本地代理 7890；连不上 GitHub 时自动走代理
powershell -NoProfile -Command "if ((Test-NetConnection 127.0.0.1 -Port 7890 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  set "HTTP_PROXY=http://127.0.0.1:7890"
  set "HTTPS_PROXY=http://127.0.0.1:7890"
  set "ALL_PROXY=http://127.0.0.1:7890"
  echo [提示] 检测到本地代理 7890，已自动启用（Clash 等）
  echo.
)

"%GIT%" status -sb
echo.

REM 自动提交新增的微信校验文件等未跟踪文件
"%GIT%" add public/MP_verify_*.txt 2>nul
for /f "delims=" %%F in ('"%GIT%" diff --cached --name-only 2^>nul') do set "HAS_STAGED=1"
if defined HAS_STAGED (
  "%GIT%" commit -m "chore: 添加微信 JS 接口安全域名校验文件"
  echo [OK] 已提交校验文件
  echo.
)

"%GIT%" fetch origin main
if errorlevel 1 (
  echo.
  echo [失败] 无法连接 GitHub（443 超时）
  echo   1. 打开 Clash / VPN，确认系统代理或 TUN 已开启
  echo   2. 若代理端口不是 7890，在本脚本里改端口号
  echo   3. 或改用 SSH：见 docs/GITHUB上传-5步.md
  pause
  exit /b 1
)

for /f "tokens=1,2" %%a in ('"%GIT%" rev-list --left-right --count main...origin/main 2^>nul') do (
  set "BEHIND=%%a"
  set "AHEAD=%%b"
)

if defined BEHIND if not "%BEHIND%"=="0" (
  echo 远程有新提交，正在合并...
  "%GIT%" pull origin main --no-rebase
  if errorlevel 1 (
    echo [失败] 合并冲突，请把终端输出发给助手
    pause
    exit /b 1
  )
)

"%GIT%" push -u origin main
if errorlevel 1 (
  echo.
  echo [失败] 推送未完成
  echo   - 连不上：开 VPN / Clash 后再试
  echo   - 要登录：GitHub 会弹出浏览器授权
  pause
  exit /b 1
)

echo.
echo [成功] 已推送到 GitHub，请到 Vercel 查看 Deployments
pause
