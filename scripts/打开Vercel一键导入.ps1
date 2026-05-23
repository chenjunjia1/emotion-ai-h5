$envFile = Join-Path $PSScriptRoot "..\docs\vercel-一键导入.env"
$doc = Join-Path $PSScriptRoot "..\docs\Vercel一键导入-只点3下.md"

Write-Host ""
Write-Host "=== Vercel 一键导入（不用点 8 次）===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 浏览器会打开 Vercel（请登录后进入 emotion-ai-h5-v2）" -ForegroundColor Yellow
Write-Host "2. Settings -> Environment Variables" -ForegroundColor Yellow
Write-Host "3. 点 Import .env -> 选这个文件:" -ForegroundColor Yellow
Write-Host "   $envFile" -ForegroundColor Green
Write-Host "4. 三个环境都勾选 -> Import -> Deployments -> Redeploy" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $envFile) {
  Set-Clipboard -Value (Get-Content $envFile -Raw -Encoding UTF8)
  Write-Host "已把 .env 内容复制到剪贴板！" -ForegroundColor Green
  Write-Host "若网页有 Paste .env，可直接 Ctrl+V 粘贴。" -ForegroundColor Green
} else {
  Write-Host "找不到 env 文件" -ForegroundColor Red
}

Start-Process $doc
Start-Process "https://vercel.com/dashboard"

Read-Host "按 Enter 关闭"
