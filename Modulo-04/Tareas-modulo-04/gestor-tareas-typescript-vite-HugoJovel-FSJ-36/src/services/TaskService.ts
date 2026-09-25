import type { Task, TaskInput, TaskUpdate, TaskFilters } from '../types/task.types';
import { StorageService } from './StorageService';
import { generateId } from '../utils/id';

const STORAGE_KEY = 'gestor-tareas:v1';

/**
 * TaskService contiene toda la logica de negocio relacionada con las tareas:
 * crear, editar, eliminar, marcar como completadas, filtrar y buscar.
 * No conoce nada sobre el DOM: esto lo hace facil de probar de forma aislada
 * y mantiene la separacion entre "logica" y "presentacion" (arquitectura limpia).
 */
export class TaskService {
  private tasks: Task[];
  private readonly storage: StorageService<Task[]>;

  constructor() {
    this.storage = new StorageService<Task[]>(STORAGE_KEY);
    this.tasks = this.storage.load([]);
  }

  private persist(): void {
    this.storage.save(this.tasks);
  }

  getAll(): Task[] {
    // Copia defensiva: quien consuma esto no debe poder mutar el estado interno.
    return [...this.tasks];
  }

  getById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(input: TaskInput): Task {
    const title = input.title.trim();
    if (!title) {
      throw new Error('El titulo de la tarea es obligatorio.');
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateId(),
      title,
      description: input.description.trim(),
      category: input.category.trim() || 'Otro',
      priority: input.priority,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks = [newTask, ...this.tasks];
    this.persist();
    return newTask;
  }

  update(id: string, changes: TaskUpdate): Task {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new Error(`No existe una tarea con id "${id}".`);
    }

    const current = this.tasks[index]!;
    const title = changes.title !== undefined ? changes.title.trim() : current.title;
    if (!title) {
      throw new Error('El titulo de la tarea es obligatorio.');
    }

    const updated: Task = {
      ...current,
      title,
      description: changes.description !== undefined ? changes.description.trim() : current.description,
      category: changes.category !== undefined ? changes.category.trim() || 'Otro' : current.category,
      priority: changes.priority ?? current.priority,
      completed: changes.completed ?? current.completed,
      updatedAt: new Date().toISOString(),
    };

    this.tasks = [...this.tasks.slice(0, index), updated, ...this.tasks.slice(index + 1)];
    this.persist();
    return updated;
  }

  delete(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.persist();
  }

  toggleCompleted(id: string): Task {
    const task = this.getById(id);
    if (!task) {
      throw new Error(`No existe una tarea con id "${id}".`);
    }
    return this.update(id, { completed: !task.completed });
  }

  /** Aplica estado, prioridad y busqueda por titulo sobre la lista completa. */
  applyFilters(filters: TaskFilters): Task[] {
    const search = filters.search.trim().toLowerCase();

    return this.tasks.filter((task) => {
      const matchesStatus =
        filters.status === 'todas' ||
        (filters.status === 'completadas' && task.completed) ||
        (filters.status === 'pendientes' && !task.completed);

      const matchesPriority = filters.priority === 'todas' || task.priority === filters.priority;

      const matchesSearch = search === '' || task.title.toLowerCase().includes(search);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }

  getStats(): { total: number; completadas: number; pendientes: number } {
    const total = this.tasks.length;
    const completadas = this.tasks.filter((task) => task.completed).length;
    return { total, completadas, pendientes: total - completadas };
  }
}
