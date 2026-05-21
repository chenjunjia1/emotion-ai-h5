# 打包上传到 GitHub 的 zip（排除 node_modules、.next、环境变量）
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "dist"
$zipPath = Join-Path $outDir "emotion-ai-h5-deploy.zip"

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$excludeDirs = @(
  "node_modules", ".next", "out", "dist", ".git", ".vercel",
  ".cursor", ".npm-cache", "agent-transcripts", "mcps", "terminals"
)
$excludeFiles = @(".env", ".env.local", ".env.production", ".env.development")

$temp = Join-Path $env:TEMP ("emotion-ai-h5-pack-" + [guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $temp | Out-Null

function Should-Skip([string]$rel) {
  foreach ($d in $excludeDirs) {
    if ($rel -eq $d -or $rel.StartsWith("$d\")) { return $true }
  }
  $name = Split-Path -Leaf $rel
  foreach ($f in $excludeFiles) {
    if ($name -eq $f -or $name.StartsWith(".env")) { return $true }
  }
  return $false
}

Get-ChildItem -Path $root -Recurse -Force | ForEach-Object {
  $full = $_.FullName
  $rel = $full.Substring($root.Length + 1)
  if (Should-Skip $rel) { return }
  if ($_.PSIsContainer) {
    $dest = Join-Path $temp $rel
    if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
  } else {
    $dest = Join-Path $temp $rel
    $parent = Split-Path -Parent $dest
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item -Path $full -Destination $dest -Force
  }
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zipPath -Force
Remove-Item $temp -Recurse -Force

Write-Host ""
Write-Host "Done: $zipPath" -ForegroundColor Green
Write-Host "Size: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB"
Write-Host ""
Write-Host "Next: upload this zip to GitHub, then Vercel will auto-deploy."
