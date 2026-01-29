$ErrorActionPreference = "Stop"

$VPS_IP = "46.4.210.164"
$VPS_USER = "root"
$PACKAGE_NAME = "deploy-package.zip"

Write-Host "📦 Packaging application..." -ForegroundColor Cyan
Compress-Archive -Path "src", "public", ".env.local", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "Dockerfile", "docker-compose.yml", "postcss.config.mjs", "components.json", "eslint.config.mjs", "nginx-site.conf" -DestinationPath $PACKAGE_NAME -Force

Write-Host "🚀 Uploading to VPS ($VPS_IP)..." -ForegroundColor Cyan
scp $PACKAGE_NAME "$($VPS_USER)@$($VPS_IP):/root/"

Write-Host "🔄 deploying on VPS..." -ForegroundColor Cyan
ssh "$($VPS_USER)@$($VPS_IP)" "rm -rf app_new; mkdir app_new; unzip -o $PACKAGE_NAME -d app_new || true; cd app_new; cp .env.local .env; docker compose down; docker compose up -d --build"

Write-Host "✅ Deployment initiated!" -ForegroundColor Green
