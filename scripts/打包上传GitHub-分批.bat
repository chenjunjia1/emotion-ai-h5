@echo off
chcp 65001 >nul
set "ROOT=%~dp0.."
set "OUT=%ROOT%\github-upload-batches"

echo.
echo ===== GitHub 分批上传包（每批 under 100 files）=====
echo.

if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"

for %%D in (app components contexts hooks lib) do (
  if exist "%ROOT%\src\%%D" (
    mkdir "%OUT%\src\%%D" 2>nul
    xcopy "%ROOT%\src\%%D" "%OUT%\src\%%D\" /E /I /Y /Q >nul
    powershell -NoProfile -Command "Compress-Archive -Path '%OUT%\src\%%D' -DestinationPath '%OUT%\batch-%%D.zip' -Force"
    echo [OK] batch-%%D.zip  （解压后是 src\%%D，勿传到仓库根目录）
  )
)

echo.
echo 上传到 GitHub 仓库根目录，按顺序拖入（每批单独 Commit）:
echo   解压 batch-app.zip 后拖入「src」文件夹（内有 src\app），不要只拖 app 到根目录！
echo   1. batch-app.zip
echo   2. batch-components.zip
echo   3. batch-contexts.zip
echo   4. batch-hooks.zip
echo   5. batch-lib.zip
echo.
echo 若根目录已有错误的 app 文件夹，请先在 GitHub 删除它。
echo.
explorer "%OUT%"
pause
