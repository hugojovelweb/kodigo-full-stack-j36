"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Probe = {
  visibleCookies: string[];
  storageKeys: string[];
  clientSees: "sesión visible" | "sin sesión";
};

/**
 * Prueba viva de la protección contra robo de token por XSS: ejecuta en el
 * navegador exactamente lo que ejecutaría un script malicioso.
 */
export function SessionProbe() {
  const [probe, setProbe] = useState<Probe | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const visibleCookies = document.cookie
        .split(";")
        .map((c) => c.trim().split("=")[0] ?? "")
        .filter(Boolean);
      const storageKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
      const { data } = await createClient().auth.getSession();
      if (alive) {
        setProbe({
          visibleCookies,
          storageKeys,
          clientSees: data.session ? "sesión visible" : "sin sesión",
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!probe) return <p className="muted small">Ejecutando verificación en el navegador…</p>;

  const leaked =
    probe.visibleCookies.some((c) => c.startsWith("sb-")) ||
    probe.storageKeys.some((k) => k.toLowerCase().includes("supabase") || k.startsWith("sb-")) ||
    probe.clientSees === "sesión visible";

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
        <dt>supabase.auth.getSession() en el cliente</dt>
        <dd>{probe.clientSees}</dd>
      </dl>
    </div>
  );
}
