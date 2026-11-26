"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DIAS_CORTOS, diaSemana, formatearFechaLarga, formatearPrecio, hoyLocal, sumarDias } from "@/lib/fechas";
import type { ApiError, Profesional, ReservaInput, Servicio } from "@/lib/types";

interface Props { servicios: Servicio[]; profesionales: Profesional[]; diasAbiertos: number[]; diasAdelante: number }
interface Dia { fecha: string; etiqueta: string; numero: string; abierto: boolean }

const PASOS = ["Servicio", "Profesional", "Horario", "Tus datos"];

// Client Component: asistente de 4 pasos. useState para el flujo y useEffect para consultar la disponibilidad.
export function ReservaWizard({ servicios, profesionales, diasAbiertos, diasAdelante }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [servicioId, setServicioId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const [dias, setDias] = useState<Dia[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorSlots, setErrorSlots] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [campos, setCampos] = useState<ApiError["campos"]>({});

  const servicio = servicios.find((s) => s.id === servicioId);
  const profesional = profesionales.find((p) => p.id === profesionalId);

  // La lista de dias se calcula en el cliente (despues del montaje) para evitar diferencias servidor/cliente.
  useEffect(() => {
    const hoy = hoyLocal();
    const lista: Dia[] = Array.from({ length: diasAdelante + 1 }, (_, i) => {
      const f = sumarDias(hoy, i);
      const d = diaSemana(f);
      return { fecha: f, etiqueta: DIAS_CORTOS[d], numero: f.slice(8), abierto: diasAbiertos.includes(d) };
    });
    setDias(lista);
    setFecha((actual) => actual || lista.find((x) => x.abierto)?.fecha || "");
  }, [diasAbiertos, diasAdelante]);

  // Consulta la disponibilidad cada vez que cambia el servicio, el profesional o la fecha.
  useEffect(() => {
    if (paso !== 2 || !servicioId || !profesionalId || !fecha) return;
    const ctrl = new AbortController();
    setCargando(true);
    setErrorSlots(null);
    setHora("");
    fetch(`/api/disponibilidad?${new URLSearchParams({ servicioId, profesionalId, fecha })}`, { signal: ctrl.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
        setSlots(json.data as string[]);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setErrorSlots(e instanceof Error ? e.message : "No se pudo consultar la disponibilidad.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCargando(false);
      });
    return () => ctrl.abort(); // evita condiciones de carrera al cambiar rapido de dia
  }, [paso, servicioId, profesionalId, fecha, intento]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio("");
    setCampos({});
    const body: ReservaInput = { servicioId, profesionalId, fecha, hora, nombre, telefono };
    try {
      const res = await fetch("/api/citas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (res.status === 201) {
        router.push(`/reserva/${json.id}`);
        return;
      }
      setErrorEnvio((json as ApiError).error ?? "No se pudo confirmar la reserva.");
      setCampos((json as ApiError).campos ?? {});
      if (res.status === 409) {
        setPaso(2); // alguien tomo ese horario: volver a elegir
        setIntento((n) => n + 1);
      }
    } catch {
      setErrorEnvio("No hay conexión con el servidor. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const tarjeta = (activa: boolean) =>
    `w-full rounded-2xl border p-4 text-left transition ${activa ? "border-lima bg-superficie-2" : "border-borde bg-superficie hover:border-lima/60"}`;
  const campo = "mt-1 w-full rounded-xl border border-borde bg-superficie px-4 py-3";
  const errCampo = (k: keyof ReservaInput) => campos?.[k] && <p id={`${k}-error`} className="mt-1 text-sm font-semibold text-error">{campos[k]}</p>;

  return (
    <div>
      <ol aria-label="Progreso" className="mb-6 flex gap-2">
        {PASOS.map((p, i) => (
          <li key={p} aria-current={i === paso ? "step" : undefined} className={`flex-1 border-t-4 pt-2 text-xs font-semibold ${i <= paso ? "border-lima text-texto" : "border-borde text-tenue"}`}>
            <span className="hidden sm:inline">{i + 1}. </span>{p}
          </li>
        ))}
      </ol>

      {(servicio || profesional) && paso > 0 && (
        <p className="mb-4 rounded-xl bg-superficie px-4 py-2 text-sm text-tenue">
          {servicio?.nombre}{profesional && ` · ${profesional.nombre}`}{paso > 2 && fecha && hora && ` · ${formatearFechaLarga(fecha)} ${hora}`}
        </p>
      )}

      <div className="aparecer" key={paso}>
        {paso === 0 && (
          <ul className="space-y-3">
            {servicios.map((s) => (
              <li key={s.id}>
                <button type="button" aria-pressed={servicioId === s.id} onClick={() => { setServicioId(s.id); setPaso(1); }} className={tarjeta(servicioId === s.id)}>
                  <span className="flex items-baseline justify-between gap-3"><strong className="font-display text-lg">{s.nombre}</strong><strong>{formatearPrecio(s.precioCentavos)}</strong></span>
                  <span className="block text-sm text-tenue">{s.descripcion} · {s.duracionMin} min</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {paso === 1 && (
          <ul className="space-y-3">
            {profesionales.map((p) => (
              <li key={p.id}>
                <button type="button" aria-pressed={profesionalId === p.id} onClick={() => { setProfesionalId(p.id); setPaso(2); }} className={tarjeta(profesionalId === p.id)}>
                  <strong className="font-display text-lg">{p.nombre}</strong>
                  <span className="block text-sm font-semibold text-lima">{p.especialidad}</span>
                  <span className="block text-sm text-tenue">{p.bio}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {paso === 2 && (
          <div>
            <div role="group" aria-label="Elige un día" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
              {dias.map((d) => (
                <button key={d.fecha} type="button" disabled={!d.abierto} aria-pressed={fecha === d.fecha} onClick={() => setFecha(d.fecha)}
                  className={`min-w-16 shrink-0 rounded-2xl border px-3 py-2 text-center ${fecha === d.fecha ? "border-lima bg-lima text-fondo" : "border-borde bg-superficie"} disabled:cursor-not-allowed disabled:opacity-30`}>
                  <span className="block text-xs uppercase">{d.etiqueta}</span>
                  <span className="block font-display text-xl font-extrabold">{d.numero}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 min-h-40" aria-live="polite">
              {cargando && (
                <ul role="status" aria-label="Cargando horarios" className="grid animate-pulse grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }, (_, i) => <li key={i} className="h-11 rounded-xl bg-superficie-2" />)}
                </ul>
              )}
              {!cargando && errorSlots && (
                <div role="alert" className="rounded-2xl border border-error/60 bg-superficie p-4">
                  <p className="font-semibold">No pudimos cargar los horarios.</p>
                  <p className="text-sm text-tenue">{errorSlots}</p>
                  <button type="button" onClick={() => setIntento((n) => n + 1)} className="mt-3 rounded-full bg-lima px-5 py-2 font-bold text-fondo hover:bg-lima-oscuro">Reintentar</button>
                </div>
              )}
              {!cargando && !errorSlots && slots.length === 0 && fecha && <p className="rounded-2xl bg-superficie p-4 text-tenue">No hay horarios libres este día. Prueba con otro.</p>}
              {!cargando && !errorSlots && slots.length > 0 && (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((h) => (
                    <li key={h}><button type="button" aria-pressed={hora === h} onClick={() => setHora(h)}
                      className={`w-full rounded-xl border py-3 font-semibold ${hora === h ? "border-lima bg-lima text-fondo" : "border-borde bg-superficie hover:border-lima/60"}`}>{h}</button></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {paso === 3 && (
          <form onSubmit={confirmar} noValidate className="space-y-4">
            <div>
              <label htmlFor="nombre" className="font-semibold">Tu nombre</label>
              <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required aria-invalid={!!campos?.nombre} aria-describedby={campos?.nombre ? "nombre-error" : undefined} className={campo} />
              {errCampo("nombre")}
            </div>
            <div>
              <label htmlFor="telefono" className="font-semibold">Teléfono / WhatsApp</label>
              <input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" required aria-invalid={!!campos?.telefono} aria-describedby={campos?.telefono ? "telefono-error" : undefined} className={campo} />
              {errCampo("telefono")}
            </div>
            {errorEnvio && <p role="alert" className="rounded-xl border border-error/60 bg-superficie p-3 font-semibold text-error">{errorEnvio}</p>}
            <button type="submit" disabled={enviando} className="w-full rounded-full bg-lima px-6 py-3.5 font-bold text-fondo hover:bg-lima-oscuro disabled:opacity-60">
              {enviando ? "Confirmando…" : "Confirmar reserva"}
            </button>
          </form>
        )}
      </div>

      {paso === 2 && errorEnvio && <p role="alert" className="mt-4 rounded-xl border border-error/60 bg-superficie p-3 font-semibold text-error">{errorEnvio}</p>}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={() => { setErrorEnvio(""); setPaso((p) => Math.max(0, p - 1)); }} disabled={paso === 0} className="rounded-full border border-borde px-5 py-2 font-semibold hover:border-lima disabled:invisible">← Atrás</button>
        {paso === 2 && (
          <button type="button" disabled={!hora} onClick={() => { setErrorEnvio(""); setPaso(3); }} className="rounded-full bg-lima px-6 py-2 font-bold text-fondo hover:bg-lima-oscuro disabled:opacity-40">Continuar →</button>
        )}
      </div>
    </div>
  );
}
