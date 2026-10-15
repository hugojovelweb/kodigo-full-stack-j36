# 🔐 SecureAuth — Autenticación segura con cookies `httpOnly` en Next.js 16 + Neon Postgres

Actividad práctica · **Kodigo Full Stack Jr 36** · *Implementar capas de seguridad a nivel de servidor y estrategias de posicionamiento orgánico para aplicaciones web profesionales.*

Sistema de autenticación completo (registro, login, logout, verificación de correo, recuperación de contraseña, perfil) donde **el token de sesión nunca es accesible desde JavaScript del navegador**: vive únicamente en una cookie `httpOnly` emitida por el servidor mediante Server Actions y validada por el *proxy* (middleware) de Next.js contra **Neon Postgres**.

- 🌐 **Producción:** `https://TU-APP.vercel.app` ← *(reemplaza con tu URL)*
- 📦 **Repositorio:** `https://github.com/TU-USUARIO/auth-httponly-nextjs-HJovel-FSJ36` ← *(reemplaza)*

> **Nota sobre el stack:** el enunciado original pide Supabase. Este proyecto usa **Neon (PostgreSQL serverless)** con autenticación implementada a mano, cambio acordado con el bootcamp. Como Neon es solo base de datos, la sesión, el hash de contraseñas, los tokens y las cookies se implementan aquí de forma explícita (en lugar de delegarlos a `@supabase/ssr`). La tabla de la sección 2 muestra la equivalencia punto por punto.

---

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js **16+** (App Router, Turbopack) |
| Lenguaje | TypeScript estricto (`strict`, `noUncheckedIndexedAccess`) |
| Base de datos | **Neon** (PostgreSQL serverless) vía `@neondatabase/serverless` (consultas parametrizadas) |
| Autenticación | Propia: sesiones en BD + cookie `httpOnly`, hash `scrypt` (módulo nativo de Node) |
| Mutaciones | **Server Actions** (`"use server"`) |
| Protección de rutas | `src/proxy.ts` (en Next 16 reemplaza a `middleware.ts`) |
| Validación | `zod` (mismo esquema en cliente y servidor) |
| Correo (opcional) | Resend (API REST, sin SDK) |

> **`middleware` vs `proxy`:** desde Next.js 16 el archivo `middleware.ts` se llama `proxy.ts` (misma función: código que corre antes de cada petición). La lógica vive en `src/lib/auth/middleware.ts`. Si tu instructor exige el nombre literal, renombra `src/proxy.ts` → `src/middleware.ts` y la función `proxy` → `middleware` (Next 16 aún lo soporta con aviso de deprecación).

---

## 2. Cumplimiento de requisitos de la actividad

| Requisito del enunciado | Equivalente en este proyecto |
|---|---|
| **a)** Client para Server Components | `src/lib/db.ts` (cliente Neon `server-only`) + `src/lib/auth/dal.ts` (`getSession`/`getCurrentUser`) |
| **a)** Client para Client Components | **Deliberadamente no existe un cliente de BD en el navegador**: los Client Components solo hablan con Server Actions. La cadena de conexión nunca llega al cliente (`server-only` rompe el build si se importa desde un componente cliente). |
| **a)** Cookies httpOnly | `src/lib/auth/cookies.ts` (política única) + `src/lib/auth/session.ts` |
| **a)** Clients en middleware, server actions y route handlers | `lib/auth/middleware.ts` (proxy), `lib/actions/auth.ts`, `app/auth/confirm/route.ts`, `app/auth/signout/route.ts` |
| **b)** Registro con validación | `/registro` · `components/auth-forms.tsx` · `lib/validations/auth.ts` |
| **b)** Inicio de sesión | `/login` |
| **b)** Cierre de sesión | `signOutAction` (header), `signOutEverywhereAction` (dashboard) y `POST /auth/signout` |
| **b)** Verificación de email | Token de un solo uso por correo → `GET /auth/confirm` (se activa al configurar `RESEND_API_KEY`) |
| **b)** Recuperación de contraseña | `/recuperar-contrasena` → correo → `/actualizar-contrasena?token=…` |
| **c)** Server Actions registro/login/logout | `src/lib/actions/auth.ts` |
| **c)** Errores + validación en servidor + cookies | Mismo archivo (`zod`, mensajes genéricos, `setSessionCookie`) |
| **d)** Middleware: rutas privadas, redirecciones, refresco de sesión | `src/proxy.ts` + `src/lib/auth/middleware.ts` (sesión deslizante de 7 días) |
| **e)** Dashboard privado con datos del usuario | `/dashboard` |
| **e)** Layout con navegación condicional | `components/site-header.tsx` + `app/layout.tsx` |
| **Seguridad** flags httpOnly/secure/sameSite | `cookies.ts` |
| **Seguridad** XSS | CSP con *nonce* (`proxy.ts`), escape de React, validación servidor, sin `dangerouslySetInnerHTML` |
| **Seguridad** CSRF | `sameSite=lax`, verificación Origin/Host en Server Actions y en `POST /auth/signout` |
| **Seguridad** sin tokens en localStorage / cookies legibles | Panel *Verificación de seguridad* del dashboard lo demuestra en vivo |
| **Seguridad** variables de entorno | `.env.example`, `src/lib/env.ts`, `.gitignore` |

---

## 3. Estructura

```
auth-httponly-nextjs-HJovel-FSJ36/
├── db/schema.sql                    # users, sessions, email_tokens, rate_limits
├── scripts/
│   ├── db-migrate.mjs               # npm run db:migrate  (aplica db/schema.sql a Neon)
│   ├── setup-debian.sh              # Preparación en Debian XFCE 13
│   └── setup-windows.ps1            # Preparación en Windows (PowerShell)
├── src/
│   ├── proxy.ts                     # "Middleware" Next 16: CSP con nonce + sesión + rutas
│   ├── app/
│   │   ├── layout.tsx · page.tsx
│   │   ├── login/ registro/ recuperar-contrasena/ actualizar-contrasena/
│   │   ├── dashboard/page.tsx       # Ruta privada
│   │   └── auth/{confirm,signout}/route.ts · auth/error/page.tsx
│   ├── components/                  # Formularios (useActionState), SessionProbe, header
│   └── lib/
│       ├── db.ts                    # Cliente Neon (server-only)
│       ├── env.ts                   # Variables de entorno validadas
│       ├── email.ts                 # Envío con Resend (o log en desarrollo)
│       ├── safe-redirect.ts         # Anti open-redirect
│       ├── actions/auth.ts          # Server Actions
│       ├── validations/auth.ts      # Esquemas zod compartidos
│       └── auth/
│           ├── cookies.ts           # httpOnly + secure + sameSite (+ prefijo __Host-)
│           ├── session.ts           # Crear/validar/renovar/invalidar sesiones
│           ├── dal.ts               # getSession / getCurrentUser (segunda barrera)
│           ├── middleware.ts        # Lógica del proxy
│           ├── password.ts          # scrypt + comparación en tiempo constante
│           ├── tokens.ts            # Tokens aleatorios + SHA-256
│           └── rate-limit.ts        # Límite de intentos en Neon
├── .env.example · next.config.ts · README.md
```

---

## 4. Requisitos previos

- **Node.js ≥ 20.9** (recomendado **24 LTS**), npm y Git.
- Cuentas gratuitas en [Neon](https://neon.com), [GitHub](https://github.com) y [Vercel](https://vercel.com). *(Opcional)* [Resend](https://resend.com) para correos reales.

---

## 5. Configurar Neon (una sola vez, común a Debian y Windows)

### 5.1 Crear el proyecto
1. [console.neon.tech](https://console.neon.tech) → **Create project**.
2. Nombre `secureauth`, región más cercana (p. ej. *AWS US East*), versión de Postgres por defecto → **Create**.
3. En el panel del proyecto pulsa **Connect**, deja *Pooled connection* activado y copia la **connection string**:
   ```
   postgresql://USUARIO:CLAVE@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```
   Es un **secreto**: se usa solo en `.env.local` y en las variables de Vercel.

### 5.2 Crear las tablas (elige una opción)
- **Opción A — desde el proyecto** (después de configurar `.env.local`, sección 6/7): `npm run db:migrate`
- **Opción B — desde Neon:** **SQL Editor** → pega el contenido de [`db/schema.sql`](db/schema.sql) → **Run**.

Verifica en **Tables** que existen `users`, `sessions`, `email_tokens` y `rate_limits`.

### 5.3 Correo (opcional, recomendado para producción)
Sin `RESEND_API_KEY` la app funciona en **modo sin correo**: las cuentas nuevas quedan verificadas automáticamente y, en desarrollo, los enlaces de recuperación se imprimen en la terminal de `npm run dev`.
Para correos reales: crea una API key en Resend y agrégala (sección 8). Con el dominio de prueba `onboarding@resend.dev`, Resend **solo entrega al correo dueño de la cuenta**; para enviar a cualquier usuario verifica un dominio propio y ajusta `EMAIL_FROM`.

> Neon Free suspende el cómputo tras unos minutos sin uso: la **primera** petición después de un rato puede tardar un segundo extra. Es normal.

---

## 6. Instalación y ejecución en **Debian XFCE 13**

> Comandos para la **Terminal** de XFCE (o la terminal integrada de VS Code). Las rutas con espacios van entre comillas.

### 6.1 Herramientas base (si aún no las tienes)
```bash
sudo apt update
sudo apt install -y git curl ca-certificates unzip build-essential
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24
node -v && npm -v            # v24.x / npm 11.x
```

### 6.2 Obtener el proyecto
```bash
cd "$HOME/Projects/KODIGO /Full Stack Jr 36/kodigo-full-stack-j36/Modulo-XX/Tareas-modulo-XX"
unzip ~/Descargas/auth-httponly-nextjs-HJovel-FSJ36.zip
cd auth-httponly-nextjs-HJovel-FSJ36
```
*(Si ya tenías la versión anterior con Supabase en esa carpeta, renómbrala antes: `mv auth-httponly-nextjs-HJovel-FSJ36 auth-supabase-old`.)*

### 6.3 Instalar, configurar y crear las tablas
```bash
chmod +x scripts/setup-debian.sh
./scripts/setup-debian.sh        # verifica Node, instala dependencias, crea .env.local
nano .env.local                  # pega tu DATABASE_URL de Neon (sección 8)
npm run db:migrate               # crea las tablas en Neon
```

### 6.4 Ejecutar
```bash
npm run dev                      # http://localhost:3000
# Producción local (recomendado antes de desplegar):
npm run build && npm run start
```
```bash
npm run typecheck && npm run lint
```

---

## 7. Instalación y ejecución en **Windows 10/11** (PowerShell)

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
# cierra y abre PowerShell
cd C:\ruta\a\auth-httponly-nextjs-HJovel-FSJ36

Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-windows.ps1
notepad .env.local               # pega tu DATABASE_URL de Neon
npm run db:migrate
npm run dev                      # http://localhost:3000
```
Si PowerShell bloquea scripts: `npm install`, `Copy-Item .env.example .env.local`, `npm run db:migrate`, `npm run dev`.

---

## 8. Variables de entorno

Copia `.env.example` → `.env.local` (está en `.gitignore`; nunca se sube a GitHub).

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Connection string **pooled** de Neon con `?sslmode=require`. **Secreto**, sin prefijo `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública sin barra final. Local: `http://localhost:3000`. Producción: tu URL `https://`. |
| `RESEND_API_KEY` | No | Activa correos reales y la **verificación de correo obligatoria**. |
| `EMAIL_FROM` | No | Remitente, p. ej. `SecureAuth <onboarding@resend.dev>`. |

Reinicia `npm run dev` cada vez que cambies `.env.local`.

---

## 9. Uso

1. **Registro** → `/registro` (nombre, correo, contraseña de 8+ caracteres con mayúscula, minúscula y número).
   - Con Resend configurado: llega un correo; al abrir el enlace el correo queda confirmado y luego inicias sesión.
   - Sin Resend: la cuenta queda lista y entras directo al dashboard.
2. **Login** → `/login`. Con sesión abierta, `/login` y `/registro` redirigen a `/dashboard`.
3. **Dashboard** → datos de la cuenta, vencimiento de la sesión, edición de perfil y la **verificación de seguridad de la sesión**.
4. **Recuperar contraseña** → `/recuperar-contrasena` → enlace (por correo, o en la terminal de `npm run dev` sin Resend) → `/actualizar-contrasena?token=…`. Al cambiarla se **cierran todas las sesiones** de esa cuenta.
5. **Cerrar sesión** → botón del header, o *Cerrar sesión en todos los dispositivos* en el dashboard.

Abrir `/dashboard` sin sesión redirige a `/login?next=/dashboard`; tras iniciar sesión vuelves a esa ruta (solo rutas internas).

---

## 10. Seguridad: qué se hizo y por qué

### Sesión y cookie `httpOnly`
- Al iniciar sesión se genera un token aleatorio de **256 bits**. En la cookie viaja el token; en la base de datos solo su **hash SHA-256**: si la BD se filtrara, esos hashes no sirven para suplantar sesiones.
- Cookie (`cookies.ts`):

| Flag | Valor | Efecto |
|---|---|---|
| `httpOnly` | `true` | `document.cookie` no la ve → un XSS no puede robar la sesión |
| `secure` | `true` en producción HTTPS | Solo viaja cifrada |
| `sameSite` | `lax` | No se envía en POST entre sitios → mitiga CSRF |
| `path` + prefijo `__Host-` | `/` | En producción nadie puede fijarla desde un subdominio (*cookie tossing*) |
| `expires` | 7 días, deslizante | El proxy la renueva cuando queda menos de la mitad de vida |

- **Doble barrera:** el proxy valida la cookie contra la BD en cada petición y cada página/acción vuelve a validar con `getSession()` (DAL). La identidad nunca sale de campos del formulario.
- El cierre de sesión **borra la fila en la base de datos** (no solo la cookie), y cambiar la contraseña cierra todas las sesiones.

### Contraseñas
- Hash **scrypt** (N=2¹⁷, r=8, p=1, salt aleatorio de 16 bytes), comparación con `timingSafeEqual`.
- Si el correo no existe se ejecuta igualmente un hash de relleno: el login tarda lo mismo (evita enumeración por tiempo).

### XSS
- **CSP con nonce por petición** (`proxy.ts`): `script-src 'self' 'nonce-…' 'strict-dynamic'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`.
- React escapa el contenido; sin `dangerouslySetInnerHTML`. Validación y normalización con `zod` en servidor.
- Cabeceras extra: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.

### CSRF
- `sameSite=lax`.
- **Server Actions**: solo `POST`, Next compara `Origin` con `Host`; se declara además `serverActions.allowedOrigins`.
- `POST /auth/signout` (Route Handler, donde Next no protege automáticamente) verifica `Origin === Host` → `403` si no coincide.

### Inyección SQL y datos
- Todas las consultas usan plantillas etiquetadas del driver de Neon: los valores viajan como **parámetros**, nunca concatenados.
- `CHECK` en la BD: correo en minúsculas y longitudes; `email` único.

### Abuso y enumeración
- **Límite de intentos** guardado en Neon (funciona en serverless): login 5 por 15 min por correo+IP, 30 por IP; registro y recuperación 5 por hora.
- Mensajes **genéricos**: "Correo o contraseña incorrectos"; registro y recuperación responden igual exista o no el correo (con verificación activa).
- Tokens de correo/recuperación: de un solo uso, hasheados en BD, vencen (24 h / 1 h). El enlace de recuperación consume el token con una única sentencia atómica (cambia clave + cierra sesiones).
- **Open redirect:** `next` solo acepta rutas internas.

*Mejoras opcionales fuera del alcance:* CAPTCHA (Turnstile), MFA/TOTP, auditoría de inicios de sesión.

---

## 11. Verificar manualmente que la cookie es `httpOnly`

1. Inicia sesión.
2. DevTools (`F12`) → **Application** (Chromium) o **Storage** (Firefox) → **Cookies → `http://localhost:3000`**.
3. Debe verse la cookie `sid` (en producción `__Host-sid`) con:
   - ✅ **HttpOnly** · **SameSite = Lax** · **Secure** (en producción HTTPS) · Expires ≈ 7 días.
4. **Console** → `document.cookie` → **no** debe aparecer `sid`.
5. **Local/Session Storage** → vacíos de tokens.
6. **Network** → la página trae `Content-Security-Policy` con un `nonce` distinto en cada recarga.
7. Tras cerrar sesión, la fila desaparece de la tabla `sessions` (Neon → **Tables**).

---

## 12. Plan de pruebas manual

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Abrir `/dashboard` sin sesión | Redirige a `/login?next=%2Fdashboard` |
| 2 | Registro con contraseña débil / correo inválido / claves distintas | Errores por campo en cliente **y** servidor |
| 3 | Registro válido | Con Resend: mensaje "revisa tu correo". Sin Resend: entra al dashboard |
| 4 | Enlace de confirmación (con Resend) | `/login?verified=1`; reusar el enlace → `/auth/error` |
| 5 | Registrar de nuevo el mismo correo | Con Resend: mismo mensaje genérico. Sin Resend: "Ese correo ya está registrado" |
| 6 | Login con clave incorrecta / correo inexistente | **Mismo** mensaje: "Correo o contraseña incorrectos." |
| 7 | 6 intentos fallidos seguidos | "Demasiados intentos…" |
| 8 | Login correcto | `/dashboard` (o la ruta `next`) |
| 9 | Con sesión, visitar `/login` o `/registro` | Redirige a `/dashboard` |
| 10 | Header | Con sesión: Dashboard + Cerrar sesión; sin sesión: Iniciar sesión + Registrarse |
| 11 | Editar nombre (2–60 caracteres) | Se guarda y se refleja en header y dashboard |
| 12 | Recuperar contraseña con correo inexistente | Mismo mensaje que con correo existente |
| 13 | Flujo de recuperación completo | Clave cambiada, `/login?reset=1`, sesiones anteriores cerradas |
| 14 | Reusar el enlace de recuperación | "El enlace es inválido o ya venció" |
| 15 | Cerrar sesión y pulsar "Atrás" | `/dashboard` vuelve a redirigir a `/login` |
| 16 | `/login?next=//evil.com` tras login | Va a `/dashboard` |
| 17 | `curl -X POST http://localhost:3000/auth/signout` | `403` |
| 18 | Panel de seguridad del dashboard | ✅ "JavaScript NO puede ver el token" |

---

## 13. Despliegue en Vercel

1. Sube el código a GitHub (sección 14).
2. [vercel.com/new](https://vercel.com/new) → importa el repositorio (Framework: *Next.js*).
3. **Environment Variables**: `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` (= `https://TU-APP.vercel.app`; si aún no conoces el dominio, despliega y edítala después) y, si usas correo, `RESEND_API_KEY` y `EMAIL_FROM`.
4. **Deploy**. Tras cambiar variables: *Deployments → Redeploy*.
5. La base de datos ya tiene las tablas (sección 5.2); usa la misma de Neon o crea una *branch* de Neon para producción y ejecuta `db:migrate` contra ella.
6. Repite el plan de pruebas en producción y confirma la flag **Secure** y el prefijo `__Host-` en la cookie.

---

## 14. Publicar en GitHub (Debian y Windows)

```bash
git config --global user.name  "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"

git init -b main
git add .
git status                     # verifica que NO aparezca .env.local
git commit -m "feat: autenticación con cookies httpOnly en Next.js 16 y Neon Postgres"
git remote add origin https://github.com/TU-USUARIO/auth-httponly-nextjs-HJovel-FSJ36.git
git push -u origin main
```
Para un historial más claro puedes dividirlo en commits convencionales: `chore: scaffold Next.js 16` → `feat(db): esquema Neon` → `feat(auth): sesiones, hash y cookies httpOnly` → `feat(auth): server actions y validación zod` → `feat(proxy): protección de rutas y CSP con nonce` → `feat(ui): páginas y dashboard` → `docs: README y plan de pruebas`.

---

## 15. Solución de problemas

| Síntoma | Causa / solución |
|---|---|
| `Falta la variable de entorno DATABASE_URL` | No existe `.env.local` o no reiniciaste `npm run dev` |
| `db:migrate`: `Falta DATABASE_URL` | Ejecuta el comando en la raíz del proyecto; requiere Node ≥ 20.6 |
| `password authentication failed` / `ENOTFOUND` | Connection string mal copiada; vuelve a copiarla desde **Connect** (con `?sslmode=require`) |
| `relation "users" does not exist` | No se crearon las tablas: `npm run db:migrate` o SQL Editor |
| Primera petición lenta | Neon Free despierta el cómputo; es normal |
| No llegan correos | Falta `RESEND_API_KEY`, o usas `onboarding@resend.dev` con un destinatario que no es el dueño de la cuenta Resend |
| Sin Resend no veo el enlace de recuperación | Mira la **terminal donde corre `npm run dev`** (línea `📧 [DEV]`); en producción sin Resend no se registra |
| Cookie sin `Secure` en producción | `NEXT_PUBLIC_SITE_URL` apunta a `http://localhost…` en Vercel; debe ser tu URL `https://` |
| Debian: `node: command not found` | `source ~/.bashrc` o abre una terminal nueva |
| Windows: script `.ps1` bloqueado | `Set-ExecutionPolicy -Scope Process Bypass` |
| Puerto 3000 ocupado | `npm run dev -- -p 3001` y ajusta `NEXT_PUBLIC_SITE_URL` |

---

## 16. Créditos

Proyecto educativo — Kodigo Full Stack Jr 36. Autor: **Hugo Jovel** · [hugojovelweb.tech](https://hugojovelweb.tech/)
