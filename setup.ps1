Write-Host "🥗 NutrIA Dashboard - Setup" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Cyan
npm install

if (-not (Test-Path .env)) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!" -ForegroundColor Yellow
}

# Frontend
Write-Host ""
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install

if (-not (Test-Path .env)) {
    Write-Host "📝 Criando arquivo .env do frontend..." -ForegroundColor Cyan
    Copy-Item .env.example .env
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup completo!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o desenvolvimento:" -ForegroundColor Cyan
Write-Host "  Backend:  npm run dev"
Write-Host "  Frontend: cd frontend; npm run dev"
Write-Host ""
Write-Host "Não esqueça de configurar o .env com suas credenciais!" -ForegroundColor Yellow
