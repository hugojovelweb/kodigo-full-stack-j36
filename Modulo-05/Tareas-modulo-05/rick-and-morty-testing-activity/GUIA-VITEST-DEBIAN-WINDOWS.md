# Actividad: Pirámide de pruebas automatizadas con Vitest
**Proyecto:** Rick and Morty Explorer (Next.js 16 + React 19) · **Bootcamp:** Kodigo Full Stack Jr 36
**Cierre:** domingo 18 de octubre de 2026, 23:59

Resultado verificado: **9 archivos, 42 pruebas, 100 % en Statements / Branches / Functions / Lines** (umbral exigido: 80 %).

---

## 1. Entorno Debian XFCE 13 (trixie)

### 1.1 Herramientas base
```bash
sudo apt update
sudo apt install -y git curl ca-certificates build-essential
```

### 1.2 Node.js 22 LTS con nvm (sin sudo para paquetes globales)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v    # v22.x
```

### 1.3 pnpm (el repo trae pnpm-lock.yaml)
```bash
corepack enable
corepack prepare pnpm@latest --activate
# si corepack no está disponible:  npm install -g pnpm
pnpm -v
```

### 1.4 Fork y clonado
1. En el navegador abre https://github.com/Kodigo-academic/rick-and-morty-testing-activity y pulsa **Fork** (tu cuenta `hugojovelweb`).
2. Clona TU fork:
```bash
mkdir -p ~/kodigo && cd ~/kodigo
git clone https://github.com/<TU_USUARIO>/rick-and-morty-testing-activity.git
cd rick-and-morty-testing-activity
git config user.name  "Tu Nombre"
git config user.email "tu-correo@ejemplo.com"
```

### 1.5 Aplicar los archivos de esta entrega
Descomprime `rick-and-morty-testing-activity-vitest.zip` y copia su contenido **encima** del fork (sobrescribe):
```bash
unzip -o ~/Descargas/rick-and-morty-testing-activity-vitest.zip -d /tmp/rm-vitest
cp -r /tmp/rm-vitest/rick-and-morty-testing-activity/. .
pnpm install
```
> Si pnpm avisa de "Ignored build scripts" (sharp, unrs-resolver) es normal: ya están en `pnpm-workspace.yaml` y no se necesitan para las pruebas.

### 1.6 Ejecutar
```bash
pnpm exec vitest run --coverage      # comando oficial de la actividad
```
Abrir el reporte HTML:
```bash
xdg-open coverage/index.html
```

### 1.7 Captura de pantalla (evidencia obligatoria)
Maximiza la terminal para que se vea **toda** la tabla, vuelve a ejecutar el comando y toma la captura con:
```bash
xfce4-screenshooter -r        # selecciona la región de la terminal
# o la tecla Impr Pant
```
Debe verse: porcentajes **por archivo** y fila **All files** con el total global. (Se incluye `evidencia-cobertura-consola.png` como referencia con la salida real; para la entrega usa tu propia captura.)

### 1.8 Subir al fork
```bash
git checkout -b feat/vitest-coverage
git add -A
git status                  # confirma que coverage/ aparece
git commit -m "test: configura Vitest y suite unitaria con 100% de cobertura"
git push -u origin feat/vitest-coverage
# entrega la rama (o haz merge a main en tu fork, según indique Kodigo)
```
> **Importante:** el `.gitignore` original ignoraba `/coverage`. Esta entrega lo quita para que `coverage/` se suba, como pide el entregable. Verifícalo con `git ls-files coverage | head`.

---

## 2. Windows 10/11 (PowerShell)

```powershell
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS.LTS
# cierra y abre PowerShell
node -v
corepack enable
corepack prepare pnpm@latest --activate     # o: npm install -g pnpm
pnpm -v

mkdir $HOME\kodigo; cd $HOME\kodigo
git clone https://github.com/<TU_USUARIO>/rick-and-morty-testing-activity.git
cd rick-and-morty-testing-activity
# copia aquí el contenido del zip (sobrescribe) y luego:
pnpm install
pnpm exec vitest run --coverage
start coverage\index.html
```
- Captura: `Win + Shift + S`.
- Si PowerShell bloquea scripts: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Alternativa: instalar WSL2 con Debian y seguir la sección 1.

---

## 3. Qué se implementó

| Archivo | Qué hace |
|---|---|
| `vitest.config.ts` | jsdom, plugin React, alias `@`, cobertura v8 (`text`, `html`, `json-summary`) y **thresholds 80 %** |
| `src/test/setup.ts` | jest-dom, `cleanup` automático y mock de `next/image` |
| `src/test/fixtures.ts` | Fábricas `makeCharacter`, `makeEpisode`, `makeCharacterResponse`, `mockFetchOnce` |
| `src/lib/api.test.ts` | URLs, éxito, errores `!ok`, `[]` sin llamar a la API, objeto único → arreglo |
| `src/components/CharacterCard.test.tsx` | Contenido, enlace, imagen, color por estado (Alive/Dead/unknown + valor desconocido) |
| `src/components/Pagination.test.tsx` | Primera, intermedia, última y única página |
| `src/components/SiteFooter.test.tsx` | Sello Hugo Jovel Web: año dinámico (fake timers), enlace, `target`, `rel` |
| `src/app/page.test.tsx` | Server Component: `?page=`, valor por defecto, parámetro como arreglo, error |
| `src/app/character/[id]/page.test.tsx` | Detalle, ids de episodios, tipo vacío → "Unknown", estados, error |
| `src/app/error.test.tsx`, `loading.test.tsx`, `layout.test.tsx` | Estados de error/carga y layout |

Cambios al código de la app (mínimos):
- `src/components/SiteFooter.tsx` (nuevo) y uso en `layout.tsx`: footer con el sello en un solo punto.
- `error.tsx`: `couldn't` → `couldn&apos;t` (arregla un error de ESLint existente; se ve igual).
- `eslint.config.mjs`: ignora `coverage/**`. `package.json`: scripts de prueba, devDependencies y `"type": "module"`.

Decisiones de cobertura: se excluye `src/types/**` (solo interfaces TypeScript, sin código ejecutable), y los tests y `src/test/**`.

---

## 4. Checklist de entrega
- [ ] Fork en GitHub con las pruebas
- [ ] `vitest.config.ts` en la raíz
- [ ] Dependencias en `package.json` (`vitest`, `@vitest/coverage-v8`, `jsdom`, Testing Library, `@vitejs/plugin-react`)
- [ ] `pnpm exec vitest run --coverage` sin fallos
- [ ] `coverage/index.html` subido al repo
- [ ] Captura con tabla por archivo y total global
- [ ] Footer con el sello visible en todas las páginas (`pnpm dev` → http://localhost:3000)

## 5. Problemas frecuentes
| Síntoma | Solución |
|---|---|
| `Cannot find module '@/…'` | Revisa el alias en `vitest.config.ts` |
| `document is not defined` | Falta `environment: 'jsdom'` |
| Cobertura < 80 % y el comando falla | Es el umbral funcionando: abre `coverage/index.html` y mira líneas sin cubrir |
| `coverage/` no sube a GitHub | Quita `/coverage` del `.gitignore` |
| Node muy viejo | Usa Node 22 (`nvm install 22`) |
