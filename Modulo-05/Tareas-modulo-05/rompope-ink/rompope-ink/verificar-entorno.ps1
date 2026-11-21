# verificar-entorno.ps1 — Windows (PowerShell): revisa el proyecto ANTES de subirlo a Amplify.
# Uso:  .\verificar-entorno.ps1 [-Ruta C:\ruta\proyecto] [-RunBuild]
# Si PowerShell bloquea el script:  Set-ExecutionPolicy -Scope Process Bypass
param([string]$Ruta = ".", [switch]$RunBuild)
$ErrorActionPreference = "Continue"
Set-Location $Ruta
$script:Err = 0
function Ok($m)    { Write-Host "  [OK]    $m" -ForegroundColor Green }
function Fail($m)  { Write-Host "  [FALLA] $m" -ForegroundColor Red; $script:Err = 1 }
function Warn($m)  { Write-Host "  [AVISO] $m" -ForegroundColor Yellow }

Write-Host "== Herramientas =="
if (Get-Command node -ErrorAction SilentlyContinue) {
  $v = [version]((node -v).TrimStart('v'))
  if ($v -ge [version]"20.9.0") { Ok "Node v$v (>= 20.9)" } else { Fail "Node v$v es menor a 20.9 (Next.js 16 lo exige). Instala: winget install OpenJS.NodeJS.LTS" }
} else { Fail "Node no instalado (winget install OpenJS.NodeJS.LTS)" }
if (Get-Command npm -ErrorAction SilentlyContinue) { Ok "npm $(npm -v)" } else { Fail "npm no instalado" }
if (Get-Command git -ErrorAction SilentlyContinue) { Ok (git --version) } else { Fail "git no instalado (winget install Git.Git)" }

Write-Host "== Proyecto: $(Get-Location) =="
if (Test-Path package.json) { Ok "package.json" } else { Fail "falta package.json (¿carpeta correcta?)" }
if (Test-Path package-lock.json) { Ok "package-lock.json" } else { Fail "sin package-lock.json: amplify.yml usa npm ci. Genéralo con npm install y súbelo" }
if ((Test-Path package.json) -and (Select-String -Path package.json -Pattern '"build"' -Quiet)) { Ok 'script "build"' } else { Fail 'package.json sin script "build"' }
if ((Test-Path package.json) -and (Select-String -Path package.json -Pattern '"next"' -Quiet)) { Ok "dependencia next" } else { Fail "no se encontró next en package.json" }
if (Test-Path .env.example) { Ok ".env.example" } else { Fail "falta .env.example" }
if (Test-Path amplify.yml) { Ok "amplify.yml" } else { Warn "sin amplify.yml (Amplify generará uno; se recomienda incluirlo)" }
if (Test-Path README.md) { Ok "README.md" } else { Fail "falta README.md" }

Write-Host "== Seguridad =="
if (git rev-parse --is-inside-work-tree 2>$null) {
  $env_tracked = git ls-files | Where-Object { $_ -match '(^|/)\.env(\.[a-z]+)?$' -and $_ -notmatch '\.example$' }
  if ($env_tracked) { Fail "hay .env versionados en Git: $($env_tracked -join ', ') (git rm --cached y rota las claves)" } else { Ok "ningún .env real está versionado" }
} else { Warn "no es un repositorio Git todavía (git init)" }
if ((Test-Path .gitignore) -and (Select-String -Path .gitignore -Pattern '^\.env' -Quiet)) { Ok ".gitignore ignora .env*" } else { Fail ".gitignore no ignora .env*" }

Write-Host "== Sello de footer (skill sello-footer) =="
$dirs = @("app","components","src") | Where-Object { Test-Path $_ }
$hit = if ($dirs) { Get-ChildItem $dirs -Recurse -Include *.tsx,*.jsx,*.ts,*.js | Select-String -Pattern "Hugo Jovel Web" -List } else { $null }
if ($hit) { Ok "sello 'Hugo Jovel Web' encontrado" } else { Fail "no se encontró el sello de footer (usa site-footer.tsx)" }

if ($RunBuild) {
  Write-Host "== Build local =="
  npm ci; if ($LASTEXITCODE -eq 0) { npm run build }
  if ($LASTEXITCODE -eq 0) { Ok "npm run build sin errores" } else { Fail "npm run build falló" }
} else { Write-Host "(Para probar el build:  .\verificar-entorno.ps1 -RunBuild)" }

Write-Host ""
if ($script:Err -eq 0) { Write-Host "Listo para subir a GitHub y desplegar en Amplify." -ForegroundColor Green } else { Write-Host "Corrige los puntos marcados como FALLA antes de desplegar." -ForegroundColor Red }
exit $script:Err
