@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo [%date% %time%] 开始刷新今日爆品热点（hot_topics 管线）...
node scripts\seed-hot-topics.mjs --via-api
if errorlevel 1 (
  echo 刷新失败，请检查 .env.local 中 CRON_SECRET / BASE_URL 与 Supabase 配置
  exit /b 1
)
echo 完成。
exit /b 0
