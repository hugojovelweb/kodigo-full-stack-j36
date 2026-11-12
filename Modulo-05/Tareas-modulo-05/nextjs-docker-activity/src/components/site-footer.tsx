import { Suspense } from "react";
import { CurrentYear } from "./current-year";

// Sello de footer — Hugo Jovel Web (skill sello-footer).
// Único punto del proyecto: se monta una sola vez en app/layout.tsx.
export function SiteFooter({ stack }: { stack: string }) {
  return (
    <footer className="site-footer border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      {stack}
      <br />© {/* SELLO: reemplazar al cierre del pago (solo maquetas de cliente) */}
      <Suspense fallback={<span className="inline-block w-[4ch]" aria-hidden />}>
        <CurrentYear />
      </Suspense>{" "}
      <a
        href="https://hugojovelweb.tech/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        <strong>Hugo Jovel Web</strong>
      </a>
      . Todos los derechos reservados.
    </footer>
  );
}
