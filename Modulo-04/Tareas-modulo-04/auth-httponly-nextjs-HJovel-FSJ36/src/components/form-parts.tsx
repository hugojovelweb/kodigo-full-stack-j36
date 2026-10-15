"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/validations/auth";

export function SubmitButton({ children, pendingText = "Procesando…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
};

export function Field({ name, label, type = "text", autoComplete, defaultValue, errors, hint, required = true }: FieldProps) {
  const errId = `${name}-error`;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errId : undefined}
      />
      {hint && !errors?.length && <small className="muted">{hint}</small>}
      {errors?.length ? (
        <small id={errId} className="error" role="alert">
          {errors[0]}
        </small>
      ) : null}
    </div>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p className={state.ok ? "notice success" : "notice danger"} role={state.ok ? "status" : "alert"}>
      {state.message}
    </p>
  );
}
