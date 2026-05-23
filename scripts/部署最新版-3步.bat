@echo off
chcp 65001 >nul
set "ROOT=%~dp0.."
set "ZIP=%ROOT%\emotion-ai-h5-上传GitHub.zip"
set "DOC=%ROOT%\docs\部署最新版-3步.md"

echo.
echo ===== 部署最新 V1 代码到线上 =====
echo.

if not exist "%ZIP%" (
  echo [1/3] 正在打包...
  call "%~dp0打包上传GitHub.bat"
) else (
  echo [OK] 压缩包已就绪: %ZIP%
)

if exist "%ROOT%\docs\vercel-一键导入.env" (
  type "%ROOT%\docs\vercel-一键导入.env" | clip
  echo [OK] Vercel 环境变量已复制到剪贴板
)

start "" "%DOC%"
start https://github.com/chenjunjia1/emotion-ai-h5/tree/main/src
start https://vercel.com/chenjunjia1/emotion-ai-h5/deployments
explorer /select,"%ZIP%"

echo.
echo 请按打开的文档完成 GitHub 上传（约 3 分钟）
pause
