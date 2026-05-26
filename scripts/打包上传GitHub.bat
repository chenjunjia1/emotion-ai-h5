@echo off
chcp 65001 >nul
set "ROOT=%~dp0.."
set "OUT=%ROOT%\github-upload-pack"
set "ZIP=%ROOT%\emotion-ai-h5-上传GitHub.zip"

echo.
echo ===== 正在打包（不含 node_modules / .env）=====
echo.

if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"

xcopy "%ROOT%\src" "%OUT%\src\" /E /I /Y /Q >nul
if exist "%ROOT%\public" xcopy "%ROOT%\public" "%OUT%\public\" /E /I /Y /Q >nul
if exist "%ROOT%\supabase" xcopy "%ROOT%\supabase" "%OUT%\supabase\" /E /I /Y /Q >nul

for %%F in (
  package.json
  package-lock.json
  next.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
  next-env.d.ts
  .eslintrc.json
  vercel.json
) do (
  if exist "%ROOT%\%%F" copy /Y "%ROOT%\%%F" "%OUT%\" >nul
)

if not exist "%OUT%\scripts" mkdir "%OUT%\scripts"
for %%F in (
  seed-hot-topics.mjs
  每日8点刷新爆品.bat
) do (
  if exist "%ROOT%\scripts\%%F" copy /Y "%ROOT%\scripts\%%F" "%OUT%\scripts\" >nul
)

if not exist "%OUT%\docs" mkdir "%OUT%\docs"
if exist "%ROOT%\docs\每日爆品-DeepSeek定时任务.md" copy /Y "%ROOT%\docs\每日爆品-DeepSeek定时任务.md" "%OUT%\docs\" >nul

if exist "%ZIP%" del /f "%ZIP%"
powershell -NoProfile -Command "Compress-Archive -Path '%OUT%\*' -DestinationPath '%ZIP%' -Force"

echo [OK] 已生成压缩包:
echo    %ZIP%
echo.
echo 接下来请双击打开: docs\GITHUB上传-5步.md
echo.

start "" "%ROOT%\docs\GITHUB上传-5步.md"
explorer /select,"%ZIP%"

pause
