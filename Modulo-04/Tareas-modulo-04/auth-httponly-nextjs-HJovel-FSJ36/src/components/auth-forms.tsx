"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/lib/actions/auth";
import {
  forgotPasswordSchema,
  initialState,
  profileSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";
import { Field, FormMessage, SubmitButton } from "./form-parts";
import { useClientValidation } from "./use-client-validation";

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signInAction, initialState);
  const { clientErrors, onSubmit } = useClientValidation(signInSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };
  return (
    <form action={action} onSubmit={onSubmit} noValidate className="stack">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <Field name="email" label="Correo electrónico" type="email" autoComplete="email" defaultValue={state.values?.email} errors={errors.email} />
      <Field name="password" label="Contraseña" type="password" autoComplete="current-password" errors={errors.password} />
      <SubmitButton pendingText="Ingresando…">Iniciar sesión</SubmitButton>
      <p className="muted small">
        <Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link> · <Link href="/registro">Crear cuenta</Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initialState);
  const { clientErrors, onSubmit } = useClientValidation(signUpSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };
  return (
    <form action={action} onSubmit={onSubmit} noValidate className="stack">
      <FormMessage state={state} />
      <Field name="displayName" label="Nombre" autoComplete="name" defaultValue={state.values?.displayName} errors={errors.displayName} />
      <Field name="email" label="Correo electrónico" type="email" autoComplete="email" defaultValue={state.values?.email} errors={errors.email} />
      <Field name="password" label="Contraseña" type="password" autoComplete="new-password" hint="8+ caracteres, con mayúscula, minúscula y número." errors={errors.password} />
      <Field name="confirmPassword" label="Confirmar contraseña" type="password" autoComplete="new-password" errors={errors.confirmPassword} />
      <SubmitButton pendingText="Creando cuenta…">Crear cuenta</SubmitButton>
      <p className="muted small">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialState);
  const { clientErrors, onSubmit } = useClientValidation(forgotPasswordSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };
  return (
    <form action={action} onSubmit={onSubmit} noValidate className="stack">
      <FormMessage state={state} />
      <Field name="email" label="Correo electrónico" type="email" autoComplete="email" defaultValue={state.values?.email} errors={errors.email} />
      <SubmitButton pendingText="Enviando…">Enviar enlace</SubmitButton>
      <p className="muted small"><Link href="/login">Volver a iniciar sesión</Link></p>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, initialState);
  const { clientErrors, onSubmit } = useClientValidation(updatePasswordSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };
  return (
    <form action={action} onSubmit={onSubmit} noValidate className="stack">
      <FormMessage state={state} />
      <Field name="password" label="Nueva contraseña" type="password" autoComplete="new-password" hint="8+ caracteres, con mayúscula, minúscula y número." errors={errors.password} />
      <Field name="confirmPassword" label="Confirmar nueva contraseña" type="password" autoComplete="new-password" errors={errors.confirmPassword} />
      <SubmitButton pendingText="Guardando…">Actualizar contraseña</SubmitButton>
    </form>
  );
}

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  const { clientErrors, onSubmit } = useClientValidation(profileSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };
  return (
    <form action={action} onSubmit={onSubmit} noValidate className="stack">
      <FormMessage state={state} />
      <Field name="displayName" label="Nombre para mostrar" defaultValue={state.values?.displayName ?? displayName} errors={errors.displayName} />
      <SubmitButton pendingText="Guardando…">Guardar perfil</SubmitButton>
    </form>
  );
}
