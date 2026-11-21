"use client";
import { useState } from "react";
import { ESTILOS } from "../lib/tattoos";

const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50300000000";
const STUDIO = process.env.NEXT_PUBLIC_STUDIO_NAME ?? "Rompope Ink";

export function Booking() {
  const [estilo, setEstilo] = useState<string>(ESTILOS[0]);
  const esEjemplo = /0{6,}$/.test(NUMBER);
  const msg = `Hola ${STUDIO}, quiero agendar una cita para un tatuaje estilo ${estilo}.`;
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(msg)}`;

  return (
    <>
      <div className="form">
        <label htmlFor="estilo" className="sr">Estilo</label>
        <select id="estilo" value={estilo} onChange={(e) => setEstilo(e.target.value)}>
          {ESTILOS.map((e) => <option key={e}>{e}</option>)}
        </select>
        <a className="btn" href={href} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
      </div>
      {esEjemplo && <p className="note">* Número de ejemplo. Se configura con NEXT_PUBLIC_WHATSAPP_NUMBER.</p>}
    </>
  );
}
