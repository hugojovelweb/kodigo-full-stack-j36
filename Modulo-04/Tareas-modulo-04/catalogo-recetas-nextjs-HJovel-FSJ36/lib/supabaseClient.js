import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
      "Revisa tu archivo .env.local."
  );
}

// Cliente de Supabase para Server Components (solo lectura pública vía RLS).
// cache: "no-store" evita que Next.js guarde en caché las respuestas de
// Supabase entre builds: cada request trae los datos reales de la base.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
  },
});