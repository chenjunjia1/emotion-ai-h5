# 双击或在 PowerShell 运行: .\scripts\打开Vercel并复制环境变量.ps1
$txt = Join-Path $PSScriptRoot "..\docs\VERCEL-环境变量-照着填.txt"
if (-not (Test-Path $txt)) {
  Write-Host "找不到文件: $txt" -ForegroundColor Red
  exit 1
}

$lines = Get-Content $txt -Encoding UTF8 | Where-Object {
  $_ -notmatch '^\s*#' -and $_.Trim() -ne ''
}

Write-Host ""
Write-Host "======== 请按下面 8 对在 Vercel 里 Add New ========" -ForegroundColor Cyan
Write-Host "（每对：Key = 第1行，Value = 第2行，三个环境都勾选）" -ForegroundColor Yellow
Write-Host ""

$i = 0
while ($i -lt $lines.Count) {
  $key = $lines[$i].Trim()
  $val = if ($i + 1 -lt $lines.Count) { $lines[$i + 1].Trim() } else { "" }
  if ($key -match '^[A-Z_]+$') {
    Write-Host "[$($key)]" -ForegroundColor Green
    Write-Host "  $val" -ForegroundColor Gray
    $i += 2
  } else {
    $i += 1
  }
}

Write-Host ""
Write-Host "正在打开 Vercel 环境变量页面..." -ForegroundColor Cyan
Start-Process "https://vercel.com/dashboard"

Write-Host ""
Write-Host "操作步骤:" -ForegroundColor Yellow
Write-Host "1. 在 Vercel 点进项目 emotion-ai-h5-v2"
Write-Host "2. Settings -> Environment Variables"
Write-Host "3. 按上面 8 对逐条 Add New"
Write-Host "4. Deployments -> 最新 -> ... -> Redeploy"
Write-Host ""

Read-Host "按 Enter 关闭"
