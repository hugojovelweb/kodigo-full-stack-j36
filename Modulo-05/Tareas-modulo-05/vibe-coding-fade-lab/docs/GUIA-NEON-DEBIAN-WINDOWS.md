# Guía paso a paso · Neon + Debian XFCE 13 + Windows + Vercel

Cierre de la actividad: **jueves 26 nov 2026, 23:59**. Orden recomendado: 1 → 2 → 3 → 4 → 5 → 6 → 7.

> Las pantallas de Neon y Vercel pueden cambiar de nombre o de lugar; los pasos describen la idea y los campos clave.

## 1. Preparar el entorno

### Debian XFCE 13
```bash
sudo apt update && sudo apt install -y git curl ca-certificates build-essential unzip
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22 && node -v && npm -v      # Next 16 exige Node 20.9 o superior
git config --global user.name "Hugo Jovel"
git config --global user.email "tu-correo@ejemplo.com"
```

### Windows 10/11 (PowerShell)
```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
# cierra y reabre PowerShell
node -v; npm -v; git --version
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # solo si npm queda bloqueado
```

## 2. Crear la base de datos en Neon (nombre: `fade-lab` / base `fadelab`)

1. Entra a **console.neon.tech** → **New project** (o *Create project*).
2. **Project name:** `fade-lab` · **Postgres version:** la que venga por defecto (17 o superior).
3. **Region:** *AWS US East (N. Virginia)* (la más cercana a El Salvador entre las comunes) · **Database name:** `fadelab`.
4. Pulsa **Create**. Neon crea la rama `main`, la base `fadelab` y el rol `neondb_owner`.
5. En el panel del proyecto pulsa **Connect**. Elige rama `main`, base `fadelab`, rol `neondb_owner` y deja activado **Connection pooling**.
6. Copia la cadena `postgresql://…@ep-xxxx-pooler….neon.tech/fadelab?sslmode=require`. **Es una contraseña: no la pegues en chats, capturas ni en GitHub.**
   Si se filtra: Neon → *Roles* → *Reset password*.

Opcional (buena práctica): crea una rama **`dev`** (Branches → *Create branch* desde `main`). Usa la cadena de `dev` en tu `.env.local` y la de `main` en Vercel.

## 3. Colocar el proyecto y configurar

```bash
# Debian (comillas por los espacios en la ruta)
cd "$HOME/Projects/KODIGO /Full Stack Jr 36/kodigo-full-stack-j36/Modulo-05/Tareas-modulo-05"
unzip ~/Descargas/fade-lab.zip && cd vibe-coding-fade-lab
npm install
cp .env.example .env.local
nano .env.local        # pega DATABASE_URL de Neon y cambia ADMIN_API_KEY (Ctrl+O, Enter, Ctrl+X)
```
```powershell
# Windows
cd "C:\ruta\kodigo-full-stack-j36\Modulo-05\Tareas-modulo-05"
Expand-Archive "$HOME\Downloads\fade-lab.zip" .
cd vibe-coding-fade-lab; npm install; Copy-Item .env.example .env.local; notepad .env.local
```

## 4. Crear las tablas y los datos (elige una opción)

**Opción A · Script (recomendada):**
```bash
npm run db:setup
# OK  schema.sql (...)  ·  OK  seed.sql (...)  ·  Listo. Servicios cargados: 6
```
**Opción B · Neon SQL Editor:** en Neon abre **SQL Editor**, pega el contenido de `db/schema.sql` → *Run*; luego `db/seed.sql` → *Run*.

Verifica en el SQL Editor:
```sql
SELECT count(*) FROM servicios;      -- 6
SELECT nombre, tipo FROM negocios;   -- Fade Lab | barberia
```
Ambos archivos son **idempotentes**: puedes ejecutarlos varias veces sin duplicar datos.

## 5. Correr y probar

```bash
npm test            # 5 pruebas del generador de horarios
npm run dev         # http://localhost:3000
```

- [ ] Las 6 rutas cargan: `/`, `/servicios`, `/equipo`, `/reservar`, `/contacto`, y el comprobante tras reservar
- [ ] `/reservar`: elegir servicio → profesional → día; se ve el esqueleto de carga y luego los horarios
- [ ] Reservar una cita; repetir el **mismo** horario con el mismo profesional → ya no aparece (o da 409 si lo fuerzas)
- [ ] Domingo aparece deshabilitado; menú móvil funciona (DevTools → 375 px)
- [ ] Footer con sello en todas las páginas; el enlace abre en pestaña nueva
- [ ] `npm run build` termina sin errores

Probar la API:
```bash
curl http://localhost:3000/api/servicios
curl "http://localhost:3000/api/disponibilidad?servicioId=UUID&profesionalId=UUID&fecha=2026-11-27"
curl -H "x-admin-key: TU_ADMIN_API_KEY" http://localhost:3000/api/citas
```
Probar el error UI: en Neon pausa o cambia temporalmente `DATABASE_URL` por una inválida y recarga `/servicios`: aparece la pantalla *"Algo salió mal"* con *Reintentar*.

## 6. Commits iterativos (evidencia del proceso)

Haz los commits **mientras avanzas**, no todos al final:
```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs .gitignore .env.example
git commit -m "chore: inicializa proyecto Next.js 16 con TypeScript, Tailwind CSS 4 y cliente Neon"
git add db scripts && git commit -m "feat(db): esquema Neon con restricción anti-traslape, seed y script db:setup"
git add lib/config.ts lib/types.ts lib/fechas.ts lib/slots.ts lib/slots.test.ts && git commit -m "feat(domain): generador de horarios como función pura con pruebas"
git add lib/db.ts lib/repositories lib/disponibilidad.ts lib/validacion.ts lib/http.ts && git commit -m "feat(data): repositorios, disponibilidad y validación en servidor"
git add app/api && git commit -m "feat(api): Route Handlers de servicios, profesionales, disponibilidad y citas"
git add app/globals.css app/layout.tsx components/site-header.tsx components/site-footer.tsx app/loading.tsx app/error.tsx app/not-found.tsx
git commit -m "feat(ui): tema, layout, header responsive, footer con sello y estados loading/error/404"
git add app/page.tsx app/servicios app/equipo app/contacto && git commit -m "feat(pages): inicio, servicios, equipo y contacto como Server Components"
git add components/reserva-wizard.tsx app/reservar app/reserva && git commit -m "feat(reserva): asistente de 4 pasos y comprobante con aviso por WhatsApp"
git add Dockerfile .dockerignore public && git commit -m "chore: Dockerfile multi-stage opcional y robots.txt"
git add README.md VIBE_CODING.md docs && git commit -m "docs: README, bitácora de Vibe Coding y guía"
git push
```
Antes de subir verifica que `.env.local` **no** aparezca en `git status`.

## 7. Desplegar en Vercel

1. vercel.com → **Add New → Project** → importa el repo.
2. **Root Directory:** la carpeta del proyecto (p. ej. `Modulo-05/Tareas-modulo-05/vibe-coding-fade-lab`).
3. **Environment Variables:** `DATABASE_URL`, `NEGOCIO_SLUG=fade-lab`, `NEXT_PUBLIC_SITE_URL` (tu URL de Vercel), `ADMIN_API_KEY`.
4. **Deploy** → copia la URL, pégala en el README (línea *Producción*) y haz commit.
5. Prueba en producción: reserva una cita real y comprueba que aparece en Neon: `SELECT * FROM citas ORDER BY creada_en DESC;`.

CLI alternativa: `npx vercel login` → `npx vercel` → `npx vercel --prod`.

## 8. Entrega

URL del repo + URL de Vercel. `README.md` y `VIBE_CODING.md` ya van dentro del repo. Abre ambos enlaces en ventana privada antes de enviar.

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| `Falta DATABASE_URL` | Revisa que `.env.local` exista y reinicia `npm run dev` |
| `No existe el negocio "fade-lab"` | Ejecuta `npm run db:setup` |
| `password authentication failed` | Copia de nuevo la cadena de Neon (o resetea la contraseña del rol) |
| `extension "btree_gist" is not available` | Ejecuta el esquema en Neon (la soporta); no uses una base local sin esa extensión |
| `Node.js version >=20.9.0 is required` | `nvm install 22 && nvm use 22` |
| Puerto 3000 ocupado | `npm run dev -- -p 3001` |
| Falla en Vercel por ruta | Revisa **Root Directory** |
| `node --test` no entiende `.ts` | Actualiza Node: `nvm install 22` (usa la última 22.x) |
