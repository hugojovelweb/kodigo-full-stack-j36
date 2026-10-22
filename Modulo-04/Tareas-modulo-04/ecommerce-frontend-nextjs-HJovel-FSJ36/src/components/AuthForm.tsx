"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import type { FormState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

const initial: FormState = {};

function Field({
  label, name, type = "text", state, autoComplete,
}: {
  label: string; name: string; type?: string; state: FormState; autoComplete?: string;
}) {
  const errs = state.errors?.[name];
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        defaultValue={type === "password" ? "" : state.values?.[name] ?? ""}
        aria-invalid={Boolean(errs)}
        aria-describedby={errs ? `${name}-err` : undefined}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-200"
      />
      {errs && <p id={`${name}-err`} className="mt-1 text-sm text-red-600">{errs.join(" ")}</p>}
    </div>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [state, action] = useActionState(mode === "login" ? loginAction : registerAction, initial);
  const isLogin = mode === "login";

  return (
    <form action={action} className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" noValidate>
      <h1 className="text-2xl font-bold text-slate-900">{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h1>
      <input type="hidden" name="next" value={next} />
      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.message}</p>
      )}
      {!isLogin && <Field label="Nombre" name="name" state={state} autoComplete="name" />}
      <Field label="Correo electrónico" name="email" type="email" state={state} autoComplete="email" />
      <Field label="Contraseña" name="password" type="password" state={state} autoComplete={isLogin ? "current-password" : "new-password"} />
      {!isLogin && (
        <Field label="Confirmar contraseña" name="password_confirmation" type="password" state={state} autoComplete="new-password" />
      )}
      <SubmitButton className="w-full" pendingText={isLogin ? "Entrando…" : "Creando cuenta…"}>
        {isLogin ? "Entrar" : "Registrarme"}
      </SubmitButton>
      <p className="text-center text-sm text-slate-600">
        {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link className="font-semibold text-indigo-700 hover:underline" href={`${isLogin ? "/registro" : "/login"}?next=${encodeURIComponent(next)}`}>
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </form>
  );
}
