# 🔐 SecureAuth — Autenticación segura con cookies `httpOnly` en Next.js 16 + Supabase

# Alumno: Hugo Ernesto Jovel Hernánndez Kodigo Full Stack Jr - 36

Actividad práctica · **Kodigo Full Stack Jr 36** · *Implementar capas de seguridad a nivel de servidor y estrategias de posicionamiento orgánico para aplicaciones web profesionales.*

Sistema de autenticación completo (registro, login, logout, recuperación de contraseña, perfil con base de datos) donde **el token de sesión nunca es accesible desde JavaScript del navegador**: vive únicamente en cookies `httpOnly` gestionadas por el servidor con `@supabase/ssr`, Server Actions y el *proxy* (middleware) de Next.js.

- 🌐 **Producción:** `https://TU-APP.vercel.app` ← *(reemplaza con tu URL de Vercel)*
- 📦 **Repositorio:** `https://github.com/TU-USUARIO/auth-httponly-nextjs-HJovel-FSJ36` ← *(reemplaza)*

---

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js **16+** (App Router, Turbopack) |
| Lenguaje | TypeScript estricto (`strict`, `noUncheckedIndexedAccess`) |
| Auth + DB | Supabase (Auth + PostgreSQL + RLS) vía `@supabase/ssr` |
| Mutaciones | **Server Actions** (`"use server"`) |
| Protección de rutas | `src/proxy.ts` (en Next 16 reemplaza a `middleware.ts`) |
| Validación | `zod` (mismo esquema en cliente y servidor) |
| Estilos | CSS plano (sin dependencias extra) |

> **Nota sobre `middleware` vs `proxy`:** desde Next.js 16 el archivo `middleware.ts` se renombró a `proxy.ts` (misma función: código que se ejecuta antes de cada petición). Esta app usa `src/proxy.ts`, y la lógica de Supabase vive en `src/lib/supabase/middleware.ts` (nombre usado en la documentación de Supabase). Si tu instructor exige literalmente el nombre `middleware.ts`, basta con renombrar `src/proxy.ts` → `src/middleware.ts` y la función exportada `proxy` → `middleware`; Next 16 aún lo soporta (con aviso de deprecación).

---

## 2. Cumplimiento de requisitos de la actividad

| Requisito | Dónde está |
|---|---|
| **a)** Supabase client para Server Components | `src/lib/supabase/server.ts` |
| **a)** Supabase client para Client Components | `src/lib/supabase/client.ts` |
| **a)** Cookies httpOnly con `@supabase/ssr` | `src/lib/supabase/cookie-options.ts` (+ `server.ts`, `middleware.ts`) |
| **a)** Clients en middleware, server actions y route handlers | `middleware.ts` (proxy), `lib/actions/auth.ts`, `app/auth/confirm/route.ts`, `app/auth/signout/route.ts` |
| **b)** Registro con validación | `/registro` · `components/auth-forms.tsx` · `lib/validations/auth.ts` |
| **b)** Inicio de sesión | `/login` |
| **b)** Cierre de sesión | `signOutAction` (botón en el header) y `POST /auth/signout` |
| **b)** Verificación de email | Plantilla + `GET /auth/confirm` (sección 5.3) |
| **b)** Recuperación de contraseña | `/recuperar-contrasena` → correo → `/actualizar-contrasena` |
| **c)** Server Actions registro/login/logout | `src/lib/actions/auth.ts` |
| **c)** Errores de auth + validación en servidor + cookies | Mismo archivo (`zod` + mensajes genéricos + `createClient()` con cookies endurecidas) |
| **d)** Middleware: rutas privadas, redirecciones, refresco de sesión | `src/proxy.ts` + `src/lib/supabase/middleware.ts` |
| **e)** Dashboard privado con datos del usuario | `/dashboard` |
| **e)** Layout con navegación condicional | `components/site-header.tsx` + `app/layout.tsx` |
| **Seguridad** flags httpOnly/secure/sameSite | `cookie-options.ts` |
| **Seguridad** XSS | CSP con *nonce* (`proxy.ts`), escape de React, validación servidor, sin `dangerouslySetInnerHTML` |
| **Seguridad** CSRF | `sameSite=lax`, verificación Origin/Host en Server Actions y en `POST /auth/signout` |
| **Seguridad** sin tokens en localStorage / cookies legibles | Panel *Verificación de seguridad* en `/dashboard` lo demuestra en vivo |
| **Seguridad** variables de entorno | `.env.example`, `src/lib/env.ts`, `.gitignore` |
| **Buenas prácticas** clients separados / loading / errores / TS | Ver estructura (sección 3) |

---

## 3. Estructura del proyecto

```
auth-httponly-nextjs-HJovel-FSJ36/
├── supabase/schema.sql              # Tabla profiles + RLS + trigger (ejecutar en Supabase)
├── scripts/
│   ├── setup-debian.sh              # Preparación en Debian XFCE 13
│   └── setup-windows.ps1            # Preparación en Windows (PowerShell)
├── src/
│   ├── proxy.ts                     # "Middleware" Next 16: CSP con nonce + sesión + rutas
│   ├── app/
│   │   ├── layout.tsx               # Layout con navegación condicional
│   │   ├── page.tsx                 # Inicio
│   │   ├── login/ registro/ recuperar-contrasena/ actualizar-contrasena/
│   │   ├── dashboard/page.tsx       # Ruta privada
│   │   └── auth/
│   │       ├── confirm/route.ts     # Route Handler: canjea el enlace del correo
│   │       ├── signout/route.ts     # Route Handler: logout por POST con check de Origin
│   │       └── error/page.tsx
│   ├── components/                  # Formularios (useActionState), SessionProbe, header
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts            # Client: Server Components / Actions / Route Handlers
│   │   │   ├── client.ts            # Client: Client Components (sin acceso a la sesión)
│   │   │   ├── middleware.ts        # Client: proxy (refresca sesión + protege rutas)
│   │   │   └── cookie-options.ts    # httpOnly + secure + sameSite (política única)
│   │   ├── actions/auth.ts          # Server Actions
│   │   ├── validations/auth.ts      # Esquemas zod compartidos
│   │   ├── safe-redirect.ts         # Anti open-redirect
│   │   └── env.ts                   # Variables de entorno validadas
│   └── types/database.ts            # Tipos de la base de datos
├── .env.example
├── next.config.ts                   # Cabeceras de seguridad + límites de Server Actions
└── README.md
```

---

## 4. Requisitos previos

- **Node.js ≥ 20.9** (probado con 22; recomendado **24 LTS**), npm, Git.
- Una cuenta gratuita en [Supabase](https://supabase.com), [GitHub](https://github.com) y [Vercel](https://vercel.com).

---

## 5. Configurar Supabase (una sola vez, común a Debian y Windows)

### 5.1 Crear el proyecto
1. Supabase → **New project** → nombre `secureauth` (plan Free) → guarda la contraseña de la base de datos.
2. **Project Settings → API** (o *Connect*): copia **Project URL** y la **Publishable key** (`sb_publishable_…`; en proyectos antiguos se llama *anon key*).

### 5.2 Crear tabla, RLS y trigger
1. **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
2. Verifica en **Table Editor** que existe `profiles` con el candado de **RLS activado**.

### 5.3 Configurar Authentication
1. **Authentication → Sign In / Providers → Email**: activa *Email* y deja **Confirm email** activado.
2. **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (cámbiala a tu URL de Vercel al desplegar).
   - **Redirect URLs:** agrega `http://localhost:3000/**` y `https://TU-APP.vercel.app/**`.
3. **Authentication → Email Templates** (para el flujo seguro `token_hash` del lado del servidor):
   - **Confirm signup** → cambia el enlace por:
     ```html
     <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Confirmar mi correo</a>
     ```
   - **Reset Password** → cambia el enlace por:
     ```html
     <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/actualizar-contrasena">Restablecer contraseña</a>
     ```

> El servidor de correo integrado de Supabase tiene un límite bajo de envíos por hora (pensado para pruebas). Si lo alcanzas, espera o configura un SMTP propio en *Authentication → SMTP Settings*. Para pruebas rápidas puedes desactivar temporalmente *Confirm email*.

---

## 6. Instalación y ejecución en **Debian XFCE 13**

> Todos los comandos se ejecutan en **Terminal Emulator (XFCE)**. Las rutas con espacios van entre comillas.

### 6.1 Herramientas base (si aún no las tienes)
```bash
sudo apt update
sudo apt install -y git curl ca-certificates unzip build-essential
git --version

# Node.js 24 LTS con nvm (sin sudo, no ensucia el sistema)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24
node -v && npm -v          # debe mostrar v24.x y npm 11.x
```

### 6.2 Obtener el proyecto
**Opción A — desde el .zip descargado** (ajusta `Modulo-XX` a tu carpeta de trabajo):
```bash
cd "$HOME/Projects/KODIGO /Full Stack Jr 36/kodigo-full-stack-j36/Modulo-XX/Tareas-modulo-XX"
unzip ~/Descargas/auth-httponly-nextjs-HJovel-FSJ36.zip
cd auth-httponly-nextjs-HJovel-FSJ36
```
**Opción B — desde tu repositorio de GitHub:**
```bash
git clone https://github.com/TU-USUARIO/auth-httponly-nextjs-HJovel-FSJ36.git
cd auth-httponly-nextjs-HJovel-FSJ36
```

### 6.3 Instalar y configurar
```bash
chmod +x scripts/setup-debian.sh
./scripts/setup-debian.sh        # verifica Node, instala dependencias, crea .env.local, corre typecheck
```
Edita `.env.local` con tus datos de Supabase (sección 7):
```bash
nano .env.local                  # o:  code .env.local
```

### 6.4 Ejecutar
```bash
npm run dev                      # desarrollo → http://localhost:3000
# Producción local (recomendado probar antes de desplegar):
npm run build && npm run start
```
Abre `http://localhost:3000` en Firefox/Chromium (XFCE: *Web Browser*).

### 6.5 Calidad
```bash
npm run typecheck                # TypeScript sin errores
npm run lint                     # ESLint (eslint-config-next)
```

---

## 7. Instalación y ejecución en **Windows 10/11**

> Usa **PowerShell** (no CMD). Para Git y Node puedes usar `winget` (incluido en Windows 11 y Windows 10 actualizado).

```powershell
# 1) Herramientas (una sola vez; cierra y vuelve a abrir PowerShell al terminar)
winget install Git.Git
winget install OpenJS.NodeJS.LTS
node -v ; npm -v ; git --version

# 2) Entrar a la carpeta del proyecto (ZIP descomprimido o git clone)
cd C:\ruta\a\auth-httponly-nextjs-HJovel-FSJ36

# 3) Instalar + crear .env.local
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-windows.ps1
notepad .env.local              # completa las variables

# 4) Ejecutar
npm run dev                     # http://localhost:3000
```
Si PowerShell bloquea scripts, usa los comandos manuales: `npm install`, `Copy-Item .env.example .env.local`, `npm run dev`.

---

## 8. Variables de entorno

Copia `.env.example` → `.env.local` (este archivo **está en `.gitignore`**; nunca se sube a GitHub).

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto, p. ej. `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable `sb_publishable_…` (o la *anon key* en proyectos antiguos) |
| `NEXT_PUBLIC_SITE_URL` | URL pública de la app, sin barra final. Local: `http://localhost:3000` |

⚠️ **No uses** la clave `service_role` en este proyecto ni la expongas con el prefijo `NEXT_PUBLIC_`. La clave publicable es pública por diseño: la protección real de los datos la dan las **políticas RLS**.

Reinicia `npm run dev` cada vez que cambies `.env.local`.

---

## 9. Uso

1. **Registro** → `/registro`: nombre, correo y contraseña (8+ caracteres, mayúscula, minúscula y número). Recibes un correo de confirmación.
2. **Confirmar correo** → el enlace pasa por `/auth/confirm`, que crea la sesión (cookies `httpOnly`) y te lleva a `/dashboard`.
3. **Login** → `/login`. Si ya estás autenticado, el proxy te redirige a `/dashboard`.
4. **Dashboard** → datos de tu cuenta, edición de perfil (tabla `profiles` con RLS) y la **verificación de seguridad de sesión**.
5. **Recuperar contraseña** → `/recuperar-contrasena` → correo → `/actualizar-contrasena`.
6. **Cerrar sesión** → botón del header (Server Action: invalida el token en Supabase y borra las cookies).

Intentar abrir `/dashboard` sin sesión redirige a `/login?next=/dashboard`; tras iniciar sesión vuelves a la ruta solicitada (solo rutas internas: protección *open-redirect*).

---

## 10. Seguridad: qué se hizo y por qué

### Cookies `httpOnly`, `secure`, `sameSite`
Por defecto `@supabase/ssr` **no** marca las cookies como `httpOnly` (para que el cliente de navegador pueda leerlas). Aquí se fuerzan en un único archivo (`cookie-options.ts`) y se aplican en los dos lugares donde el servidor escribe cookies: Server Components, Server Actions y Route Handlers (`server.ts`) y el proxy (`middleware.ts`):

| Flag | Valor | Efecto |
|---|---|---|
| `httpOnly` | `true` | `document.cookie` no ve el token → un XSS no puede robarlo |
| `secure` | `true` en producción HTTPS | Solo viaja cifrada |
| `sameSite` | `lax` | El navegador no envía la cookie en POST entre sitios → mitiga CSRF |
| `path` | `/` | Disponible para toda la app |

Consecuencia consciente: el *browser client* **no puede ver la sesión**. Toda operación autenticada pasa por Server Actions (el panel *Verificación de seguridad* del dashboard lo demuestra ejecutando `document.cookie`, `localStorage` y `getSession()` en el navegador).

### Autenticación del lado del servidor
- Se usa **`supabase.auth.getUser()`** (valida el JWT contra Supabase Auth) y **nunca** `getSession()` para decidir acceso.
- La identidad en Server Actions sale de la sesión, **jamás** de campos del formulario.
- El proxy refresca el token vencido en cada petición y reescribe las cookies.

### XSS
- **CSP con nonce por petición** (`proxy.ts`): `script-src 'self' 'nonce-…' 'strict-dynamic'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`.
- React escapa todo el contenido; no se usa `dangerouslySetInnerHTML`.
- Validación y normalización en servidor con `zod`; el nombre de perfil se limita a 2–60 caracteres (también con `CHECK` en la BD).
- Cabeceras extra: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.

### CSRF
- Cookies `sameSite=lax`.
- Las **Server Actions** son solo `POST` y Next.js compara `Origin` con `Host`; además se declara `serverActions.allowedOrigins` desde `NEXT_PUBLIC_SITE_URL`.
- El **Route Handler** `POST /auth/signout` (donde Next no protege automáticamente) verifica `Origin === Host` y responde `403` si no coincide.

### Otras medidas
- **Anti-enumeración de usuarios:** login devuelve el mismo mensaje para "usuario inexistente" y "clave incorrecta"; recuperación y registro responden igual exista o no el correo.
- **Mensajes de error informativos pero seguros:** nunca se muestran errores internos de Supabase.
- **Open redirect:** el parámetro `next` solo acepta rutas internas (`safe-redirect.ts`).
- **RLS:** `profiles` solo permite leer/insertar/editar la fila propia (`auth.uid() = id`).
- **Trigger `SECURITY DEFINER`** con `search_path = ''` (práctica recomendada por Supabase).
- Límite de cuerpo de Server Actions: 100 kb.
- *Mejoras opcionales fuera del alcance:* CAPTCHA (Cloudflare Turnstile) en Supabase, límite de intentos propio, MFA.

---

## 11. Verificar manualmente que las cookies son `httpOnly`

1. Inicia sesión en la app.
2. Abre DevTools (`F12`) → **Application** (Chrome/Chromium) o **Storage** (Firefox) → **Cookies → `http://localhost:3000`**.
3. Busca las cookies `sb-…-auth-token` (pueden venir en fragmentos `.0`, `.1`). Debe verse:
   - ✅ **HttpOnly** marcado · **SameSite = Lax** · **Secure** marcado en producción HTTPS.
4. En la pestaña **Console** ejecuta `document.cookie` → **no** debe aparecer ninguna cookie `sb-…`.
5. **Local Storage / Session Storage** → deben estar vacíos de tokens.
6. En **Network**, la respuesta de la página trae la cabecera `Content-Security-Policy` con un `nonce` distinto en cada recarga.

---

## 12. Plan de pruebas manual

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Abrir `/dashboard` sin sesión | Redirige a `/login?next=%2Fdashboard` |
| 2 | Registro con contraseña débil / correos inválidos / claves distintas | Errores por campo en el cliente **y** en el servidor |
| 3 | Registro válido | Mensaje genérico "revisa tu correo"; llega el correo |
| 4 | Enlace del correo | Sesión creada, aterriza en `/dashboard` |
| 5 | Reusar el mismo enlace de confirmación | Redirige a `/auth/error` |
| 6 | Login con clave incorrecta / correo inexistente | **Mismo** mensaje: "Correo o contraseña incorrectos." |
| 7 | Login correcto | Va a `/dashboard` (o a `next`) |
| 8 | Con sesión abierta, visitar `/login` o `/registro` | Redirige a `/dashboard` |
| 9 | Header | Con sesión: Dashboard + Cerrar sesión; sin sesión: Iniciar sesión + Registrarse |
| 10 | Editar nombre de perfil (2–60 caracteres) | Se guarda y se refleja en el dashboard |
| 11 | Recuperar contraseña con correo inexistente | Mismo mensaje que con correo existente |
| 12 | Flujo de recuperación completo | Cambia la clave y vuelve a `/dashboard?password=updated` |
| 13 | Cerrar sesión y pulsar "Atrás" | `/dashboard` vuelve a redirigir a `/login` |
| 14 | `/login?next=//evil.com` tras login | Va a `/dashboard` (no sale del sitio) |
| 15 | `curl -X POST http://localhost:3000/auth/signout` (sin Origin) | `403` |
| 16 | Panel de seguridad del dashboard | ✅ "JavaScript NO puede ver el token" |

---

## 13. Despliegue en Vercel

1. Sube el código a GitHub (sección 14).
2. [vercel.com/new](https://vercel.com/new) → **Import** el repositorio (Framework: *Next.js*, detectado automáticamente).
3. En **Environment Variables** agrega las **tres** variables de la sección 8 (`NEXT_PUBLIC_SITE_URL` = `https://TU-APP.vercel.app`; si aún no conoces el dominio, despliega primero y luego edítala).
4. **Deploy**. Después de cambiar variables: *Deployments → Redeploy*.
5. En Supabase → **Authentication → URL Configuration**: pon la **Site URL** de producción y agrega `https://TU-APP.vercel.app/**` a *Redirect URLs*.
6. Repite el plan de pruebas (sección 12) en producción y confirma la flag **Secure** en las cookies.

---

## 14. Publicar en GitHub (Debian y Windows, mismos comandos)

```bash
git config --global user.name  "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"

git init -b main
git add .
git status                     # verifica que NO aparezca .env.local
git commit -m "feat: autenticación con cookies httpOnly en Next.js 16 y Supabase"
git remote add origin https://github.com/TU-USUARIO/auth-httponly-nextjs-HJovel-FSJ36.git
git push -u origin main
```
Para un historial más claro (útil si tus commits son auditados), puedes dividirlo en commits convencionales, por ejemplo:
`chore: scaffold Next.js 16 con TypeScript` → `feat(supabase): clients server/client/middleware con cookies httpOnly` → `feat(auth): server actions y validación zod` → `feat(proxy): protección de rutas y CSP con nonce` → `feat(ui): páginas de auth y dashboard` → `docs: README y plan de pruebas`.

---

## 15. Solución de problemas

| Síntoma | Causa / solución |
|---|---|
| `Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL` | No existe `.env.local` o no reiniciaste `npm run dev` |
| Bucle de redirecciones a `/login` | Claves de Supabase incorrectas o Site URL/Redirect URLs mal configuradas |
| El correo no llega | Límite del SMTP integrado o carpeta de spam; configura SMTP propio |
| El enlace del correo lleva a `/auth/error` | Plantilla sin `token_hash`, enlace ya usado/vencido, o URL no está en *Redirect URLs* |
| `permission denied` / perfil vacío | No ejecutaste `supabase/schema.sql` o falta la política RLS |
| Cookies sin `Secure` en producción | `NEXT_PUBLIC_SITE_URL` apunta a `http://localhost…` en Vercel; debe ser tu URL `https://` |
| Debian: `node: command not found` tras instalar nvm | `source ~/.bashrc` o abre una terminal nueva |
| Debian: `EACCES` al instalar paquetes globales | No uses `sudo npm`; con nvm no hace falta |
| Windows: script `.ps1` bloqueado | `Set-ExecutionPolicy -Scope Process Bypass` |
| Puerto 3000 ocupado | `npm run dev -- -p 3001` y agrega ese puerto a *Redirect URLs* |

---

## 16. Licencia y créditos

Proyecto educativo — Kodigo Full Stack Jr 36. Autor: **Hugo Jovel** · [hugojovelweb.tech](https://hugojovelweb.tech/)
