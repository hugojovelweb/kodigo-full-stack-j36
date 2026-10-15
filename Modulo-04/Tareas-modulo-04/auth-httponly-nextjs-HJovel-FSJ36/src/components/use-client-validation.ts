"use client";

import { useState, type FormEvent } from "react";
import type { ZodType } from "zod";
import { flattenErrors, type FieldErrors } from "@/lib/validations/auth";

/**
 * Validación en el cliente con el MISMO esquema zod que usa el servidor.
 * Si hay errores cancela el envío; si no, deja pasar la Server Action
 * (que vuelve a validar: la validación del cliente es solo UX).
 */
export function useClientValidation(schema: ZodType) {
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const result = schema.safeParse(data);
    if (!result.success) {
      event.preventDefault();
      setClientErrors(flattenErrors(result.error));
    } else {
      setClientErrors({});
    }
  }

  return { clientErrors, onSubmit };
}
