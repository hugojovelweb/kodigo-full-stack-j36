import type { ReactNode } from "react";

export type Estilo = "Flash" | "Blackwork" | "Fine line";
export type Tattoo = { id: string; nombre: string; estilo: Estilo; art: ReactNode };

const p = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ESTILOS: Estilo[] = ["Flash", "Blackwork", "Fine line"];

export const TATTOOS: Tattoo[] = [
  { id: "daga", nombre: "Daga y corazón", estilo: "Flash", art: (
    <svg viewBox="0 0 200 170" role="img" aria-label="Ilustración de una daga"><g {...p}><path d="M100 8 L113 88 L100 100 L87 88 Z" /><path d="M68 100 H132" /><path d="M100 100 V148" /><circle cx="100" cy="158" r="7" fill="#b3261e" stroke="none" /></g></svg>) },
  { id: "corazon", nombre: "Corazón con cinta", estilo: "Flash", art: (
    <svg viewBox="0 0 200 170" role="img" aria-label="Ilustración de un corazón"><g {...p}><path d="M100 148 C18 92 38 28 100 64 C162 28 182 92 100 148 Z" fill="#b3261e" /><path d="M20 112 H180 L168 126 L180 140 H20 L32 126 Z" fill="#f0e6d2" /></g></svg>) },
  { id: "ojo", nombre: "Ojo que todo lo ve", estilo: "Blackwork", art: (
    <svg viewBox="0 0 200 170" role="img" aria-label="Ilustración de un ojo"><g {...p}><path d="M18 88 Q100 16 182 88 Q100 160 18 88 Z" /><circle cx="100" cy="88" r="27" /><circle cx="100" cy="88" r="11" fill="currentColor" /><path d="M100 14V2M44 32l-8-9M156 32l8-9" /></g></svg>) },
  { id: "ancla", nombre: "Ancla de puerto", estilo: "Blackwork", art: (
    <svg viewBox="0 0 200 170" role="img" aria-label="Ilustración de un ancla"><g {...p}><circle cx="100" cy="28" r="13" /><path d="M100 41V150M70 68H130M38 108 Q100 190 162 108M38 108l-11 12M162 108l11 12" /></g></svg>) },
  { id: "luna", nombre: "Luna y estrellas", estilo: "Fine line", art: (
    <svg viewBox="0 0 200 170" role="img" aria-label="Ilustración de una luna"><g {...p} strokeWidth={1.8}><path d="M118 18 A66 66 0 1 0 152 132 A55 55 0 1 1 118 18 Z" /><path d="M162 36l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" /><path d="M40 28l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></g></svg>) },
  { id: "montes", nombre: "Montañas y sol", estilo: "Fine line", art: (
    <svg viewBox="0 0 200 170" role="img" aria-label="Ilustración de montañas"><g {...p} strokeWidth={1.8}><path d="M10 142 L70 58 L106 106 L136 70 L190 142 Z" /><circle cx="152" cy="34" r="15" /><path d="M40 156H160" /></g></svg>) },
];
