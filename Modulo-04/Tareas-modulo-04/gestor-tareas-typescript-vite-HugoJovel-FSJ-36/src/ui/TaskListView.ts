import type { Task } from '../types/task.types';
import { el, formatDate } from '../utils/dom';

interface TaskListCallbacks {
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export function renderTaskList(tasks: Task[], hasAnyTask: boolean, callbacks: TaskListCallbacks): HTMLElement {
  if (tasks.length === 0) {
    return renderEmptyState(hasAnyTask);
  }

  const list = el('ul', { className: 'task-list', attrs: { role: 'list' } });

  for (const task of tasks) {
    list.append(renderTaskRow(task, callbacks));
  }

  return list;
}

function renderTaskRow(task: Task, callbacks: TaskListCallbacks): HTMLElement {
  const row = el('li', {
    className: `task-row task-row--${task.priority}${task.completed ? ' is-completed' : ''}`,
  });

  const checkboxWrap = el('label', { className: 'task-row__check', attrs: { 'aria-label': 'Marcar como completada' } });
  const checkbox = el('input', { attrs: { type: 'checkbox' } }) as HTMLInputElement;
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => callbacks.onToggle(task.id));
  const checkMark = el('span', { className: 'task-row__check-mark', attrs: { 'aria-hidden': 'true' } });
  checkboxWrap.append(checkbox, checkMark);

  const body = el('div', { className: 'task-row__body' });
  const title = el('p', { className: 'task-row__title', text: task.title });
  body.append(title);

  if (task.description) {
    body.append(el('p', { className: 'task-row__description', text: task.description }));
  }

  const meta = el('div', { className: 'task-row__meta' });
  meta.append(
    el('span', { className: 'tag tag--category', text: task.category }),
    el('span', { className: `tag tag--priority tag--priority-${task.priority}`, text: PRIORITY_LABEL[task.priority] }),
    el('span', { className: 'task-row__date', text: `Actualizada: ${formatDate(task.updatedAt)}` }),
  );
  body.append(meta);

  const actions = el('div', { className: 'task-row__actions' });
  const editBtn = el('button', {
    className: 'icon-btn',
    attrs: { type: 'button', 'aria-label': `Editar "${task.title}"`, title: 'Editar' },
    text: '✎',
  });
  const deleteBtn = el('button', {
    className: 'icon-btn icon-btn--danger',
    attrs: { type: 'button', 'aria-label': `Eliminar "${task.title}"`, title: 'Eliminar' },
    text: '✕',
  });
  editBtn.addEventListener('click', () => callbacks.onEdit(task.id));
  deleteBtn.addEventListener('click', () => callbacks.onDelete(task.id));
  actions.append(editBtn, deleteBtn);

  row.append(checkboxWrap, body, actions);
  return row;
}

function renderEmptyState(hasAnyTask: boolean): HTMLElement {
  const wrap = el('div', { className: 'empty-state' });
  const heading = el('p', {
    className: 'empty-state__title',
    text: hasAnyTask ? 'Ninguna tarea coincide con estos filtros.' : 'Todavia no hay tareas.',
  });
  const hint = el('p', {
    className: 'empty-state__hint',
    text: hasAnyTask
      ? 'Prueba a cambiar la busqueda o los filtros de estado y prioridad.'
      : 'Usa el boton "Nueva tarea" para crear la primera.',
  });
  wrap.append(heading, hint);
  return wrap;
}
