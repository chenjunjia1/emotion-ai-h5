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
"%GIT%" status -sb
echo.
"%GIT%" fetch origin main
"%GIT%" pull origin main --no-rebase
if errorlevel 1 (
  echo [失败] 拉取远程有冲突，请把终端输出发给助手
  pause
  exit /b 1
)
"%GIT%" push -u origin main
if errorlevel 1 (
  echo.
  echo [失败] 推送需要 GitHub 登录。请在本窗口按提示登录，或运行 Git Credential Manager。
  pause
  exit /b 1
)
echo.
echo [成功] 已推送，请到 Vercel 查看 Deployments
pause
