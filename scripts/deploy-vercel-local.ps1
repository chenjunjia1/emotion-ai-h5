# 在本机用最新代码直接部署到 Vercel（需先执行一次 vercel login）
# 用法：在 PowerShell 里（建议管理员）：
#   cd E:\emotion-ai-h5
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy-vercel-local.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "build failed" }

Write-Host "Deploying to Vercel production..." -ForegroundColor Cyan
Write-Host "If not logged in, browser will open for vercel login." -ForegroundColor Yellow

npx vercel@latest --prod --yes
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "If npx failed (EPERM/cache), try:" -ForegroundColor Yellow
  Write-Host "  1. Run PowerShell as Administrator" -ForegroundColor Yellow
  Write-Host "  2. Or use docs/VERCEL-换新站-三步.md (import from GitHub on vercel.com/new)" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Done. Open the URL printed above." -ForegroundColor Green
