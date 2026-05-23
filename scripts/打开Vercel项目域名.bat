@echo off
chcp 65001 >nul
echo Opening Vercel project Domains (login if asked)...
start https://vercel.com/chenjunjia1/emotion-ai-h5/settings/domains
timeout /t 2 >nul
start https://vercel.com/chenjunjia1/emotion-ai-h5-v2/settings/domains
echo.
echo If 404: open dashboard, click your project, then Settings - Domains
pause
