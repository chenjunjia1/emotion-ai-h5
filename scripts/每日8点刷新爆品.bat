@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo [%date% %time%] 开始刷新今日爆品热点...
node scripts\refresh-daily-hot-topics.mjs
if errorlevel 1 (
  echo 刷新失败，请检查 .env.local 中 DEEPSEEK 与 Supabase 配置
  exit /b 1
)
echo 完成。
exit /b 0
