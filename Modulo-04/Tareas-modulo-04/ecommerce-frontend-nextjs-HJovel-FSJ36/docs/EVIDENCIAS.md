# 📸 Guía de evidencias (entregables de la actividad)

Guarda las capturas en `docs/evidencias/` y arma un PDF único (por ejemplo `Evidencias-FSJ36-HJovel.pdf`) con las tres secciones.

## 1. Endpoints consumidos desde Swagger

1. Enciende la API: `php artisan serve` (carpeta de la API del Módulo 3).
2. Abre `http://localhost:8000/api/documentation`.
3. Captura el listado completo y, expandidos, estos endpoints (los que usa el frontend):

| # | Endpoint | Captura sugerida |
|---|---|---|
| 1 | `POST /auth/register` | Request body + respuesta 201 |
| 2 | `POST /auth/login` | Respuesta con `access_token` (oculta/difumina el token) |
| 3 | `GET /products` y `GET /products/{id}` | Respuesta 200 |
| 4 | `POST /orders` | Body `items` + respuesta 201 |
| 5 | `POST /orders/{id}/pay` | Respuesta de pago |
| 6 | `GET /orders` | Historial |

> Para endpoints protegidos usa **Authorize** en Swagger con `Bearer <token>`.

## 2. Prueba del flujo completo de compra

Con API + frontend (`npm run dev`) encendidos, captura en orden:

1. `/productos` (catálogo con productos) y `/productos/[id]` (detalle).
2. `/registro` completado → redirección con sesión iniciada (header “Cerrar sesión”).
3. DevTools → *Application → Cookies*: la cookie `ecom_token` con ✔ **HttpOnly**.
4. Agregar 2+ productos → `/carrito` (cambiar cantidad / quitar uno).
5. `/checkout` → botón **Crear orden y pagar**.
6. `/checkout/exito?orden=ID` (confirmación).
7. `/historial` mostrando la orden nueva.
8. (Resiliencia) Apagar la API y abrir `/productos` → pantalla de `error.tsx` con **Reintentar**.
9. (Opcional) Throttling “Slow 4G” en DevTools para mostrar `loading.tsx` / skeletons.
10. (Opcional) Sin sesión, abrir `/historial` → redirección a `/login?next=%2Fhistorial`.

## 3. Reporte Lighthouse

Mide siempre la **build de producción**, no `npm run dev`:

```bash
npm run build && npm run start          # terminal 1
npm run lighthouse                       # terminal 2 → docs/evidencias/lighthouse/*.report.html
```

O manual: Chrome → ventana de **incógnito** (sin extensiones) → `F12` → pestaña **Lighthouse** → *Navigation* + *Mobile* → categorías Performance, Accessibility, Best practices, SEO → **Analyze page load**. Rutas sugeridas: `/productos`, `/productos/1`, `/carrito`. Guarda con *⋮ → Save as HTML* o imprime a PDF.

Qué comentar en el informe (1 párrafo por métrica): **LCP** (< 2.5 s), **CLS** (< 0.1), **TBT/INP** (< 200 ms), y qué técnica del proyecto la mejora (Server Components, `fetchPriority`, skeletons con dimensiones fijas, JS de cliente mínimo, fuentes del sistema).

> Los resultados dependen de tu equipo y de la latencia de la API local; reporta tus números reales.

## Checklist final antes de entregar

- [ ] Repositorio **público** en GitHub, sin `.env.local` ni claves (`git status`)
- [ ] `.env.example` con `BASE_URL`
- [ ] `README.md` con pasos y rutas (ya incluido)
- [ ] Capturas/PDF: Swagger · flujo de compra · Lighthouse
- [ ] `npm run lint && npm run build` sin errores
