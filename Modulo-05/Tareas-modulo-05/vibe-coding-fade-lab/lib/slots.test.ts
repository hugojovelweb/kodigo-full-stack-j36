import assert from "node:assert/strict";
import { test } from "node:test";
import { generarSlots } from "./slots.ts";

const base = { fecha: "2030-01-07", abre: "09:00", cierra: "12:00", duracionMin: 30, ocupados: [], ahora: new Date("2029-01-01T00:00:00Z") };
const dt = (hora: string) => new Date(`2030-01-07T${hora}:00-06:00`);

test("genera todos los horarios dentro del horario de apertura", () => {
  assert.deepEqual(generarSlots(base), ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
});

test("un servicio de 60 min no puede empezar a las 11:30", () => {
  assert.deepEqual(generarSlots({ ...base, duracionMin: 60 }), ["09:00", "09:30", "10:00", "10:30", "11:00"]);
});

test("excluye horarios que se traslapan con una cita existente", () => {
  const ocupados = [{ inicio: dt("10:00"), fin: dt("10:30") }];
  assert.ok(!generarSlots({ ...base, ocupados }).includes("10:00"));
  // Un servicio de 60 min a las 09:30 terminaria a las 10:30 y chocaria con la cita
  assert.ok(!generarSlots({ ...base, duracionMin: 60, ocupados }).includes("09:30"));
  // Citas contiguas SI estan permitidas (el rango es [inicio, fin))
  assert.ok(generarSlots({ ...base, ocupados }).includes("10:30"));
});

test("excluye horarios pasados y respeta la anticipacion minima", () => {
  const ahora = dt("10:10"); // 10:10 + 30 min = 10:40 -> primer horario valido: 11:00
  assert.deepEqual(generarSlots({ ...base, ahora }), ["11:00", "11:30"]);
});

test("devuelve lista vacia si el dia no tiene capacidad", () => {
  assert.deepEqual(generarSlots({ ...base, duracionMin: 240 }), []);
});
