/**
 * Tipos centrales del dominio "Tarea".
 * Mantener este archivo como unica fuente de verdad de los tipos
 * evita duplicar formas de datos entre servicios y vistas.
 */

export type Priority = 'baja' | 'media' | 'alta';

export type StatusFilter = 'todas' | 'completadas' | 'pendientes';

export type PriorityFilter = Priority | 'todas';

/** Categorias sugeridas. El campo sigue siendo texto libre en el modelo. */
export const CATEGORIAS_SUGERIDAS = [
  'Trabajo',
  'Estudio',
  'Personal',
  'Salud',
  'Hogar',
  'Otro',
] as const;

export interface Task {
  readonly id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  completed: boolean;
  readonly createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Datos que llegan del formulario para crear una tarea (sin campos generados). */
export interface TaskInput {
  title: string;
  description: string;
  category: string;
  priority: Priority;
}

/** Datos parciales admitidos al editar una tarea existente. */
export type TaskUpdate = Partial<TaskInput> & { completed?: boolean };

export interface TaskFilters {
  status: StatusFilter;
  priority: PriorityFilter;
  search: string;
}
