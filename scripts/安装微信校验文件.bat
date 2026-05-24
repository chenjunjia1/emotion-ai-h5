@echo off
chcp 65001 >nul
cd /d "e:\emotion-ai-h5"

echo.
echo ===== 微信业务域名校验文件 =====
echo.
echo 1. 登录 https://mp.weixin.qq.com
echo 2. 设置 - 公众号设置 - 功能设置 - 业务域名
echo 3. 添加 www.emovalue.top 并下载 MP_verify_xxxx.txt
echo 4. 把下载的文件拖到这个窗口，按回车（或手动复制到 public\）
echo.

set /p "FILE=校验文件完整路径（可拖入）: "
if "%FILE%"=="" (
  echo [取消] 未选择文件
  pause
  exit /b 1
)

for %%F in ("%FILE%") do set "NAME=%%~nxF"
echo %NAME% | findstr /R /C:"^MP_verify_.*\.txt$" >nul
if errorlevel 1 (
  echo [错误] 文件名必须是 MP_verify_xxxx.txt
  pause
  exit /b 1
)

copy /Y "%FILE%" "public\%NAME%" >nul
if errorlevel 1 (
  echo [错误] 复制失败
  pause
  exit /b 1
)

echo.
echo [OK] 已复制到 public\%NAME%
echo.
echo 接下来请双击 scripts\git-push-一键.bat 推送到 GitHub
echo 部署后浏览器打开: https://www.emovalue.top/%NAME%
echo 能显示一行字符后，回微信公众平台点「确认」
echo.
npm run check:env
pause
