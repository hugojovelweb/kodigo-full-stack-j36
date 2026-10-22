# Instalación en Windows 10/11 (PowerShell). Uso (desde la carpeta del proyecto):
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\scripts\setup-windows.ps1
$ErrorActionPreference = "Stop"

Write-Host "1/4 Verificando Node.js y Git (winget)..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
}
Write-Host "   Si acabas de instalar Node/Git, CIERRA y vuelve a abrir PowerShell y ejecuta este script otra vez."

Write-Host "2/4 Versiones:"
node -v; npm -v

Write-Host "3/4 Variables de entorno..."
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
Write-Host "   .env.local listo (edita BASE_URL si tu API no esta en http://localhost:8000/api)"

Write-Host "4/4 Dependencias del proyecto..."
npm install

Write-Host ""
Write-Host "Listo. Arranca con:  npm run dev  ->  http://localhost:3000"
