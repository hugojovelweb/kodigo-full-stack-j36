import type { TaskFilters } from '../types/task.types';

type Listener = () => void;

/**
 * AppState guarda el estado de UI que no vive en localStorage (filtros activos,
 * tarea en edicion) e implementa un patron observador minimalista: cualquier
 * parte de la UI puede suscribirse y sera notificada cuando algo cambie,
 * sin que este modulo necesite conocer el DOM.
 */
export class AppState {
  private filters: TaskFilters = {
    status: 'todas',
    priority: 'todas',
    search: '',
  };

  private editingTaskId: string | null = null;
  private listeners: Listener[] = [];

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  getFilters(): TaskFilters {
    return { ...this.filters };
  }

  setStatusFilter(status: TaskFilters['status']): void {
    this.filters = { ...this.filters, status };
    this.notify();
  }

  setPriorityFilter(priority: TaskFilters['priority']): void {
    this.filters = { ...this.filters, priority };
    this.notify();
  }

  setSearch(search: string): void {
    this.filters = { ...this.filters, search };
    this.notify();
  }

  getEditingTaskId(): string | null {
    return this.editingTaskId;
  }

  startEditing(id: string): void {
    this.editingTaskId = id;
    this.notify();
  }

  stopEditing(): void {
    this.editingTaskId = null;
    this.notify();
  }

  /** Notificacion manual, usada tras crear/editar/eliminar tareas en el TaskService. */
  emitChange(): void {
    this.notify();
  }
}
