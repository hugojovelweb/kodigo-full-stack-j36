/**
 * StorageService encapsula TODO el acceso a localStorage.
 * Nadie mas en la aplicacion debe llamar a window.localStorage directamente:
 * esto permite cambiar el mecanismo de persistencia (p. ej. a IndexedDB o
 * a una API remota) sin tocar el resto del codigo (principio de
 * responsabilidad unica / arquitectura en capas).
 */
export class StorageService<T> {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  /** Lee y parsea el valor guardado. Devuelve el valor por defecto si no existe o esta corrupto. */
  load(defaultValue: T): T {
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[StorageService] Error al leer "${this.key}" de localStorage:`, error);
      return defaultValue;
    }
  }

  /** Serializa y guarda el valor. Devuelve false si localStorage no esta disponible (cuota llena, modo privado, etc.). */
  save(value: T): boolean {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Error al guardar "${this.key}" en localStorage:`, error);
      return false;
    }
  }

  clear(): void {
    window.localStorage.removeItem(this.key);
  }
}
