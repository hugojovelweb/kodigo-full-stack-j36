import { TaskService } from '../services/TaskService';
import { AppState } from '../state/AppState';
import { renderFilterBar } from '../ui/FilterBarView';
import { renderTaskForm } from '../ui/TaskFormView';
import { renderTaskList } from '../ui/TaskListView';
import { renderStats } from '../ui/StatsView';
import { confirmDialog } from '../ui/ConfirmDialog';
import { el, clearChildren } from '../utils/dom';
import type { TaskInput } from '../types/task.types';

/**
 * App es el "controlador" de la arquitectura: orquesta TaskService (datos),
 * AppState (estado de UI) y las funciones de ui/* (presentacion pura).
 * Cada cambio de estado dispara un re-render declarativo y economico
 * (se reconstruyen solo las secciones necesarias, no toda la pagina).
 */
export class App {
  private readonly root: HTMLElement;
  private readonly taskService = new TaskService();
  private readonly state = new AppState();

  private isFormOpen = false;

  // Referencias a los contenedores fijos del layout.
  private statsSlot!: HTMLElement;
  private formSlot!: HTMLElement;
  private filterSlot!: HTMLElement;
  private listSlot!: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state.subscribe(() => this.renderDynamicSections());
  }

  mount(): void {
    clearChildren(this.root);

    const shell = el('div', { className: 'app-shell' });

    const sidebar = el('aside', { className: 'sidebar' });
    const brand = el('div', { className: 'sidebar__brand' });
    brand.append(
      el('span', { className: 'sidebar__mark', text: '◆', attrs: { 'aria-hidden': 'true' } }),
      el('div', {
        html: '<strong>Bitácora</strong><span>Gestor de tareas</span>',
      }),
    );

    const newTaskBtn = el('button', { className: 'btn btn--primary btn--block', text: '+ Nueva tarea', attrs: { type: 'button' } });
    newTaskBtn.addEventListener('click', () => this.openCreateForm());

    this.statsSlot = el('div', { className: 'sidebar__stats-slot' });

    const footer = el('div', { className: 'sidebar__footer' });
    const footerTech = el('p', {
      className: 'sidebar__footer-line',
      text: 'Kodigo Full Stack Jr 36 — TypeScript + Vite',
    });
    const currentYear = new Date().getFullYear();
    const footerCopy = el('p', {
      className: 'sidebar__footer-line sidebar__footer-line--copy',
      html: `© ${currentYear}  <strong>Hugo Jovel Web</strong>. Todos los derechos reservados.`,
    });
    footer.append(footerTech, footerCopy);

    sidebar.append(brand, newTaskBtn, this.statsSlot, footer);

    const main = el('main', { className: 'main' });
    this.formSlot = el('div', { className: 'form-slot' });
    this.filterSlot = el('div', { className: 'filter-slot' });
    this.listSlot = el('div', { className: 'list-slot' });
    main.append(this.formSlot, this.filterSlot, this.listSlot);

    shell.append(sidebar, main);
    this.root.append(shell);

    this.renderDynamicSections();
  }

  private renderDynamicSections(): void {
    clearChildren(this.statsSlot);
    this.statsSlot.append(renderStats(this.taskService.getStats()));

    clearChildren(this.filterSlot);
    this.filterSlot.append(
      renderFilterBar(this.state.getFilters(), {
        onSearch: (value) => this.state.setSearch(value),
        onStatusChange: (value) => this.state.setStatusFilter(value),
        onPriorityChange: (value) => this.state.setPriorityFilter(value),
      }),
    );

    clearChildren(this.listSlot);
    const filteredTasks = this.taskService.applyFilters(this.state.getFilters());
    this.listSlot.append(
      renderTaskList(filteredTasks, this.taskService.getAll().length > 0, {
        onToggle: (id) => this.handleToggle(id),
        onEdit: (id) => this.openEditForm(id),
        onDelete: (id) => void this.handleDelete(id),
      }),
    );

    this.renderForm();
  }

  private renderForm(): void {
    clearChildren(this.formSlot);
    if (!this.isFormOpen) return;

    const editingId = this.state.getEditingTaskId();
    const initialTask = editingId ? this.taskService.getById(editingId) : undefined;

    this.formSlot.append(
      renderTaskForm({
        mode: editingId ? 'editar' : 'crear',
        initialTask,
        onSubmit: (input) => this.handleSubmit(input, editingId),
        onCancel: () => this.closeForm(),
      }),
    );
  }

  private openCreateForm(): void {
    this.state.stopEditing();
    this.isFormOpen = true;
    this.renderForm();
    this.formSlot.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private openEditForm(id: string): void {
    this.state.startEditing(id);
    this.isFormOpen = true;
    this.renderForm();
    this.formSlot.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private closeForm(): void {
    this.isFormOpen = false;
    this.state.stopEditing();
    this.renderForm();
  }

  private handleSubmit(input: TaskInput, editingId: string | null): void {
    try {
      if (editingId) {
        this.taskService.update(editingId, input);
      } else {
        this.taskService.create(input);
      }
      this.isFormOpen = false;
      this.state.stopEditing();
      this.renderDynamicSections();
    } catch (error) {
      // La validacion principal ya ocurre en TaskFormView; esto es una red de seguridad.
      console.error(error);
    }
  }

  private handleToggle(id: string): void {
    this.taskService.toggleCompleted(id);
    this.renderDynamicSections();
  }

  private async handleDelete(id: string): Promise<void> {
    const task = this.taskService.getById(id);
    if (!task) return;

    const confirmed = await confirmDialog(`¿Eliminar la tarea "${task.title}"? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    this.taskService.delete(id);
    if (this.state.getEditingTaskId() === id) {
      this.closeForm();
    }
    this.renderDynamicSections();
  }
}
