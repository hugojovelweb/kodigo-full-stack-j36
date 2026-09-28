/**
 * Genera un identificador unico para cada tarea.
 * Usa crypto.randomUUID() cuando esta disponible (navegadores modernos,
 * requiere contexto seguro/https o localhost) y cae a un metodo alterno
 * en caso contrario, para que la app nunca falle por esto.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  // Fallback simple basado en tiempo + numero aleatorio.
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
