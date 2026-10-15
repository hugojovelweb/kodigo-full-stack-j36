"use client";

import { useEffect, useState } from "react";

type Probe = { visibleCookies: string[]; storageKeys: string[] };

/**
 * Prueba viva de la protección contra robo de sesión por XSS: ejecuta en el
 * navegador exactamente lo que ejecutaría un script malicioso.
 */
export function SessionProbe() {
  const [probe, setProbe] = useState<Probe | null>(null);

  useEffect(() => {
    const visibleCookies = document.cookie
      .split(";")
      .map((c) => c.trim().split("=")[0] ?? "")
      .filter(Boolean);
    const storageKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
    // Se difiere para que el estado no se actualice de forma síncrona dentro del efecto.
    const id = requestAnimationFrame(() => setProbe({ visibleCookies, storageKeys }));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!probe) return <p className="muted small">Ejecutando verificación en el navegador…</p>;

  const leaked =
    probe.visibleCookies.some((c) => c === "sid" || c === "__Host-sid") ||
    probe.storageKeys.some((k) => /token|session|sid|auth/i.test(k));

  return (
    <div className="stack">
      <p className={leaked ? "notice danger" : "notice success"} role="status">
        {leaked
          ? "⚠️ JavaScript puede ver la sesión. Revisa la configuración de cookies."
          : "✅ JavaScript del navegador NO puede ver el token de sesión."}
      </p>
      <dl className="kv">
        <dt>document.cookie (nombres)</dt>
        <dd>{probe.visibleCookies.length ? probe.visibleCookies.join(", ") : "— ninguna —"}</dd>
        <dt>localStorage / sessionStorage</dt>
        <dd>{probe.storageKeys.length ? probe.storageKeys.join(", ") : "— vacío —"}</dd>
      </dl>
    </div>
  );
}
