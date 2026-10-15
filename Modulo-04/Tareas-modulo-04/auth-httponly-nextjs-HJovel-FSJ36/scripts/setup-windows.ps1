# Prepara el proyecto en Windows 10/11 (PowerShell): verifica herramientas,
# instala dependencias y crea .env.local.
# Uso (en la raíz del proyecto):
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\scripts\setup-windows.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "==> Verificando herramientas..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "X Node.js no está instalado. Instálalo con:  winget install OpenJS.NodeJS.LTS" -ForegroundColor Red
  exit 1
}
$major = [int](node -p "process.versions.node.split('.')[0]")
if ($major -lt 20) {
  Write-Host "X Node $(node -v) es muy antiguo. Se requiere >= 20.9 (recomendado 24)." -ForegroundColor Red
  exit 1
}
Write-Host "OK Node $(node -v) | npm $(npm -v) | $(git --version)"

Write-Host "==> Instalando dependencias..."
if (Test-Path package-lock.json) { npm ci } else { npm install }

if (-not (Test-Path .env.local)) {
  Copy-Item .env.example .env.local
  Write-Host "OK Creado .env.local desde .env.example"
  Write-Host "   Edítalo con tu DATABASE_URL de Neon:  notepad .env.local"
} else {
  Write-Host "• .env.local ya existe, no se modifica."
}

Write-Host "==> Verificación de tipos..."
npm run typecheck

Write-Host ""
Write-Host "Listo. Siguientes pasos:  npm run db:migrate  (crea las tablas)  y luego  npm run dev  ->  http://localhost:3000"
