@echo off
chcp 65001 >nul
set "ROOT=%~dp0.."
set "ENVFILE=%ROOT%\docs\vercel-一键导入.env"
set "DOC=%ROOT%\docs\绑定emotion.top-与上传上线.md"
set "ZIP=%ROOT%\emotion-ai-h5-上传GitHub.zip"

echo.
echo ===== emotion.top launch helper =====
echo.

if not exist "%ZIP%" (
  echo [pack] creating GitHub zip...
  call "%~dp0打包上传GitHub.bat"
)

if exist "%ENVFILE%" (
  type "%ENVFILE%" | clip
  echo [OK] env copied to clipboard for Vercel Paste
)

start "" "%DOC%"
start https://github.com/chenjunjia1/emotion-ai-h5
start https://vercel.com/dashboard
if exist "%ZIP%" explorer /select,"%ZIP%"

echo.
echo Done: doc + GitHub + Vercel + zip opened.
echo Order: bind domain - env vars - upload src - Redeploy
echo.
pause
