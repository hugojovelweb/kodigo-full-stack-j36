# Windows (PowerShell): copia tus proyectos a backend\ y frontend\ sin node_modules, vendor, .env ni builds.
# Uso:  .\scripts\import-projects.ps1 -Api "C:\ruta\api-laravel" -Front "C:\ruta\frontend-nextjs"
param(
  [Parameter(Mandatory = $true)][string]$Api,
  [Parameter(Mandatory = $true)][string]$Front
)
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path $Api))   { throw "Ruta de la API no válida: $Api" }
if (-not (Test-Path $Front)) { throw "Ruta del frontend no válida: $Front" }

# robocopy devuelve códigos 0-7 como éxito
robocopy $Api "$Root\backend" /E /XD vendor node_modules .git docker "$Api\storage\logs" /XF .env .env.* Dockerfile .dockerignore docker-compose.yml | Out-Null
robocopy $Front "$Root\frontend" /E /XD node_modules .next .git out coverage /XF .env .env.* Dockerfile Dockerfile.standalone .dockerignore docker-compose.yml | Out-Null

foreach ($d in "storage\framework\cache\data","storage\framework\sessions","storage\framework\views","storage\logs","bootstrap\cache") {
  New-Item -ItemType Directory -Force -Path "$Root\backend\$d" | Out-Null
}
Remove-Item "$Root\backend\COLOCA-AQUI-TU-API-LARAVEL.md","$Root\frontend\COLOCA-AQUI-TU-FRONTEND.md" -ErrorAction SilentlyContinue
Write-Host "Listo. Copia snippets\site-footer.tsx a frontend\src\components\ (o frontend\components\) si tu layout aún no tiene el sello,"
Write-Host "y borra backend\bootstrap\cache\*.php si existían cachés locales."
