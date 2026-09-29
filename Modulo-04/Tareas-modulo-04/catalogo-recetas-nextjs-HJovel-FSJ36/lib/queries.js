import { supabase } from "./supabaseClient";

/**
 * Devuelve todas las recetas, incluyendo el nombre de su categoría (join).
 * Usada en la página principal (Server Component).
 */
export async function getRecetas() {
  const { data, error } = await supabase
    .from("recetas")
    .select("id, slug, titulo, descripcion, imagen_url, tiempo_preparacion, dificultad, categorias(nombre, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener recetas:", error.message);
    throw new Error("No se pudieron cargar las recetas desde Supabase.");
  }

  return data;
}

/**
 * Devuelve una sola receta por su slug (ruta dinámica /recetas/[slug]).
 */
export async function getRecetaPorSlug(slug) {
  const { data, error } = await supabase
    .from("recetas")
    .select("id, slug, titulo, descripcion, ingredientes, pasos, imagen_url, tiempo_preparacion, dificultad, categorias(nombre, slug)")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No se encontró ninguna fila: lo maneja notFound() en la página.
      return null;
    }
    console.error("Error al obtener receta:", error.message);
    throw new Error("No se pudo cargar la receta desde Supabase.");
  }

  return data;
}

/**
 * Devuelve una categoría por su slug, junto con sus recetas asociadas
 * (ruta dinámica /categorias/[slug]).
 */
export async function getCategoriaConRecetas(slug) {
  const { data: categoria, error: errorCategoria } = await supabase
    .from("categorias")
    .select("id, slug, nombre, descripcion")
    .eq("slug", slug)
    .single();

  if (errorCategoria || !categoria) {
    return null;
  }

  const { data: recetas, error: errorRecetas } = await supabase
    .from("recetas")
    .select("id, slug, titulo, descripcion, imagen_url, tiempo_preparacion, dificultad")
    .eq("categoria_id", categoria.id)
    .order("created_at", { ascending: false });

  if (errorRecetas) {
    console.error("Error al obtener recetas de la categoría:", errorRecetas.message);
    throw new Error("No se pudieron cargar las recetas de esta categoría.");
  }

  return { ...categoria, recetas: recetas ?? [] };
}

/** Devuelve todas las categorías (usada en el header/navegación). */
export async function getCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, slug, nombre")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener categorías:", error.message);
    return [];
  }

  return data;
}
