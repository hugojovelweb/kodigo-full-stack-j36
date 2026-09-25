# Bitácora — Sistema de Gestión de Tareas (TypeScript + Vite)

### Hugo Ernesto Jovel Hernández - Full Stack Jr - 36

Aplicación de escritorio/web para organizar tareas diarias: crear, editar, eliminar,
marcar como completadas, filtrar por estado y prioridad, buscar por título y
persistir todo en `localStorage`. Construida en **TypeScript vanilla** (sin
frameworks de UI) con **Vite** como bundler y servidor de desarrollo, siguiendo
una arquitectura en capas (tipos → servicios → estado → vistas → controlador).

> Proyecto realizado para la actividad "Sistema de Gestión de Tareas funcional
> en TypeScript vanilla" — Kodigo Full Stack Jr 36.

---

## Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Características implementadas](#características-implementadas)
3. [Arquitectura y estructura de carpetas](#arquitectura-y-estructura-de-carpetas)
4. [Tecnologías utilizadas](#tecnologías-utilizadas)
5. [Instalación y ejecución — Debian 13 (XFCE)](#instalación-y-ejecución--debian-13-xfce)
6. [Instalación y ejecución — Windows](#instalación-y-ejecución--windows)
7. [Scripts disponibles](#scripts-disponibles)
8. [Cómo subir el proyecto a GitHub](#cómo-subir-el-proyecto-a-github)
9. [Solución de problemas comunes](#solución-de-problemas-comunes)

---

## Descripción del proyecto

**Bitácora** permite a una persona organizar sus actividades diarias de forma
intuitiva: registra tareas con título, descripción, categoría y prioridad;
las visualiza en una lista tipo "ficha de cuaderno" con codificación de color
por prioridad; las filtra por estado (todas / pendientes / completadas) y por
prioridad; y las busca por título en tiempo real. Todo el estado se guarda
automáticamente en `localStorage`, por lo que los datos sobreviven a cerrar
el navegador o reiniciar el equipo.

## Características implementadas

**Gestión de tareas**
- [x] Crear tarea con título (obligatorio), descripción, categoría y prioridad.
- [x] Editar cualquier campo de una tarea existente.
- [x] Eliminar tarea con **diálogo de confirmación** previo (modal accesible,
      se puede cancelar con `Esc` o haciendo clic fuera).
- [x] Marcar/desmarcar como completada con un checkbox estilizado.
- [x] Listado completo con contador de **Total / Pendientes / Completadas**
      en la barra lateral.

**Filtros y búsqueda**
- [x] Filtro por estado: Todas / Pendientes / Completadas (segmented control).
- [x] Filtro por prioridad: Alta / Media / Baja / Cualquiera.
- [x] Búsqueda en vivo por título (`input type="search"`, sin botón, se
      actualiza en cada tecla).
- [x] Los tres filtros son combinables entre sí.
- [x] Estado vacío distinto según si no hay tareas o si los filtros no
      arrojan resultados.

**Persistencia**
- [x] Guardado automático en `localStorage` en cada operación (crear, editar,
      eliminar, marcar).
- [x] Carga automática al iniciar la aplicación.
- [x] Manejo de errores si `localStorage` no está disponible (modo privado,
      cuota llena, etc.) sin romper la aplicación.

**Diseño**
- [x] Interfaz propia ("tema Bitácora": cuaderno de campo, tipografía
      `Fraunces` + `Inter`, filas tipo ficha en vez de tarjetas genéricas).
- [x] Responsive: barra lateral fija en escritorio, se convierte en barra
      superior en tablet/móvil; la lista de tareas se reacomoda en pantallas
      pequeñas.
- [x] Feedback visual: estados `hover`/`focus`, animación de entrada del
      formulario, tachado al completar una tarea, colores por prioridad.
- [x] Accesibilidad básica: `aria-label`, `role="list"`, foco visible,
      `prefers-reduced-motion` respetado.

## Arquitectura y estructura de carpetas

El proyecto separa **datos**, **estado de interfaz** y **presentación**, para
que cada pieza se pueda leer, probar o modificar de forma aislada:

```
task-manager/
├── index.html                 # Punto de entrada HTML
├── package.json
├── tsconfig.json              # TypeScript en modo estricto
├── vite.config.ts
├── src/
│   ├── main.ts                 # Arranca la aplicación
│   ├── style.css               # Tema visual y layout responsive
│   ├── types/
│   │   └── task.types.ts       # Task, TaskInput, TaskFilters, Priority...
│   ├── services/
│   │   ├── StorageService.ts   # Único punto de acceso a localStorage
│   │   └── TaskService.ts      # Lógica de negocio: CRUD, filtros, stats
│   ├── state/
│   │   └── AppState.ts         # Estado de UI (filtros activos, edición) + pub-sub
│   ├── ui/
│   │   ├── FilterBarView.ts    # Barra de búsqueda y filtros
│   │   ├── TaskFormView.ts     # Formulario crear/editar con validación
│   │   ├── TaskListView.ts     # Lista de tareas + estado vacío
│   │   ├── StatsView.ts        # Contadores de la barra lateral
│   │   └── ConfirmDialog.ts    # Modal de confirmación reutilizable
│   ├── app/
│   │   └── App.ts              # Controlador: conecta servicios + estado + vistas
│   └── utils/
│       ├── dom.ts               # Helpers de creación de elementos, formato de fecha
│       └── id.ts                 # Generación de IDs únicos
└── README.md
```

**Flujo de datos:** las vistas (`ui/*`) son funciones puras que reciben datos
y callbacks y devuelven un `HTMLElement`; no conocen `TaskService` ni
`localStorage`. `App.ts` es el único lugar que coordina `TaskService`
(datos + persistencia) con `AppState` (filtros, qué tarea se edita) y vuelve
a renderizar las secciones afectadas cuando algo cambia. Esto es lo que la
actividad pide como "principios de arquitectura limpia": responsabilidades
separadas y una sola fuente de verdad por capa.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| TypeScript (`strict: true`) | Tipado de todo el dominio y la UI |
| Vite | Servidor de desarrollo y bundler de producción |
| HTML5 + CSS3 puro | Estructura y estilos (sin frameworks de UI) |
| Web API `localStorage` | Persistencia de datos en el navegador |
| Git | Control de versiones |

No se usa React, Vue, Angular ni ninguna librería de componentes, tal como
pide la actividad.

---

## Instalación y ejecución — Debian 13 (XFCE)

Estos pasos asumen una instalación limpia de **Debian 13 "Trixie" con
escritorio XFCE**, usando la terminal de XFCE (`xfce4-terminal`) o la
terminal integrada de VS Code.

### 1. Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js (versión LTS) y npm

Debian 13 trae una versión de Node.js algo antigua en sus repositorios; lo
más confiable es instalar Node.js LTS desde el repositorio oficial de
NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifica las versiones instaladas (Vite 5 requiere Node.js 18 o superior):

```bash
node -v      # debe mostrar v20.x o v22.x
npm -v       # debe mostrar 10.x
```

> Alternativa sin `sudo`/repositorios externos: instalar **nvm** (Node
> Version Manager) y luego `nvm install --lts`. Es la opción recomendada si
> compartes el equipo con otros proyectos que usan distintas versiones de
> Node.

### 3. Instalar Git (si no lo tienes)

```bash
sudo apt install -y git
git --version
```

### 4. Clonar o copiar el proyecto

Si ya tienes el `.zip` de este proyecto:

```bash
mkdir -p ~/Projects/KODIGO
cd ~/Projects/KODIGO
unzip ruta/al/archivo/task-manager.zip -d task-manager
cd task-manager
```

Si lo vas a clonar desde GitHub (una vez subido, ver sección más abajo):

```bash
git clone https://github.com/hugojovelweb/kodigo-full-stack-j36.git
cd kodigo-full-stack-j36/ruta-del-proyecto
```

### 5. Instalar las dependencias del proyecto

```bash
npm install
```

### 6. Levantar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará algo como:

```
  VITE v5.4.x  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

Abre esa URL en tu navegador (Firefox ESR viene preinstalado en Debian
XFCE). Si tienes `xdg-open` configurado, `npm run dev` puede abrirla
automáticamente (así está configurado en `vite.config.ts` con `open: true`).

### 7. (Opcional) Generar la build de producción

```bash
npm run build      # genera la carpeta dist/ optimizada
npm run preview    # sirve esa build para probarla localmente
```

---

## Instalación y ejecución — Windows

### 1. Instalar Node.js

1. Ve a [nodejs.org](https://nodejs.org/) y descarga el instalador **LTS**
   para Windows (archivo `.msi`).
2. Ejecuta el instalador dejando las opciones por defecto (incluye npm y
   agrega Node al `PATH` automáticamente).
3. Reinicia la terminal y verifica:

```powershell
node -v
npm -v
```

### 2. Instalar Git para Windows

Descarga e instala [Git for Windows](https://git-scm.com/download/win). Esto
también instala **Git Bash**, una terminal tipo Unix muy útil para seguir
estos mismos comandos en Windows.

### 3. Obtener el proyecto

**Opción A — desde el `.zip`:** clic derecho → "Extraer todo..." en la
carpeta donde quieras trabajar, por ejemplo `C:\Proyectos\task-manager`.

**Opción B — clonando desde GitHub** (PowerShell, CMD o Git Bash):

```powershell
git clone https://github.com/hugojovelweb/kodigo-full-stack-j36.git
cd kodigo-full-stack-j36\ruta-del-proyecto
```

### 4. Instalar dependencias y correr el proyecto

Desde PowerShell, CMD o Git Bash, dentro de la carpeta del proyecto:

```powershell
npm install
npm run dev
```

Abre en el navegador la URL que muestre la terminal (por defecto
`http://localhost:5173/`).

> **Nota:** si PowerShell bloquea la ejecución de scripts npm con un error
> de "política de ejecución" (*execution policy*), abre PowerShell como
> administrador y ejecuta una sola vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 5. Build de producción (opcional)

```powershell
npm run build
npm run preview
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente (`http://localhost:5173`) |
| `npm run build` | Verifica tipos (`tsc`) y genera la build de producción en `dist/` |
| `npm run preview` | Sirve localmente la build generada por `build` |
| `npm run typecheck` | Solo verifica tipos de TypeScript, sin generar archivos |

## Cómo subir el proyecto a GitHub

1. Dentro de la carpeta del proyecto, inicializa el repositorio (si aún no
   forma parte de uno):

   ```bash
   git init
   git add .
   git commit -m "feat: sistema de gestion de tareas en TypeScript + Vite"
   ```

2. Crea un repositorio vacío en GitHub (o usa el repositorio único donde ya
   llevas las demás tareas del bootcamp) y conéctalo:

   ```bash
   git remote add origin https://github.com/hugojovelweb/kodigo-full-stack-j36.git
   git branch -M main
   git push -u origin main
   ```

3. Verifica que `node_modules/` y `dist/` **no** se hayan subido (ya están
   excluidos en `.gitignore`); el repositorio debe contener solo el código
   fuente y los archivos de configuración.

4. Antes de la entrega, confirma que alguien pueda reproducir el proyecto
   solo con `git clone` + `npm install` + `npm run dev`.

## Solución de problemas comunes

- **`npm: command not found` / `node: command not found`** → Node.js no
  quedó en el `PATH`. En Debian, reinstala siguiendo el paso 2; en Windows,
  reinicia la terminal después de instalar y confirma que "Add to PATH"
  quedó marcado durante la instalación.
- **Puerto 5173 ocupado** → Vite ofrecerá automáticamente el siguiente
  puerto libre (5174, 5175...); usa la URL que muestre en la terminal.
- **Los datos desaparecen entre navegadores** → `localStorage` es por
  navegador (y por perfil). Las tareas creadas en Firefox no aparecerán en
  Chrome ni en una ventana de incógnito.
- **Error de permisos con `npm install` en Debian** → evita usar `sudo npm
  install` dentro del proyecto; si `npm` fue instalado con `nvm`, no se
  necesitan permisos de administrador para instalar dependencias locales.
