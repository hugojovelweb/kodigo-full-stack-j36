import type { Priority, Task, TaskInput } from '../types/task.types';
import { CATEGORIAS_SUGERIDAS } from '../types/task.types';
import { el } from '../utils/dom';

interface TaskFormOptions {
  mode: 'crear' | 'editar';
  initialTask?: Task;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export function renderTaskForm(options: TaskFormOptions): HTMLElement {
  const { mode, initialTask, onSubmit, onCancel } = options;

  const form = el('form', { className: 'task-form', attrs: { novalidate: 'true' } }) as HTMLFormElement;

  const heading = el('h2', {
    className: 'task-form__title',
    text: mode === 'crear' ? 'Nueva tarea' : 'Editar tarea',
  });

  // --- Titulo ---
  const titleGroup = el('div', { className: 'field' });
  const titleLabel = el('label', { text: 'Titulo', attrs: { for: 'task-title' } });
  const titleInput = el('input', {
    className: 'field__input',
    attrs: { id: 'task-title', name: 'title', type: 'text', maxlength: '80', required: 'true', placeholder: 'Ej. Preparar presentacion del sprint' },
  }) as HTMLInputElement;
  titleInput.value = initialTask?.title ?? '';
  const titleError = el('p', { className: 'field__error', text: '' });
  titleGroup.append(titleLabel, titleInput, titleError);

  // --- Descripcion ---
  const descGroup = el('div', { className: 'field' });
  const descLabel = el('label', { text: 'Descripcion', attrs: { for: 'task-description' } });
  const descInput = el('textarea', {
    className: 'field__input field__input--area',
    attrs: { id: 'task-description', name: 'description', rows: '3', maxlength: '400', placeholder: 'Detalles opcionales de la tarea' },
  }) as HTMLTextAreaElement;
  descInput.value = initialTask?.description ?? '';
  descGroup.append(descLabel, descInput);

  // --- Categoria ---
  const categoryGroup = el('div', { className: 'field' });
  const categoryLabel = el('label', { text: 'Categoria', attrs: { for: 'task-category' } });
  const categoryInput = el('input', {
    className: 'field__input',
    attrs: { id: 'task-category', name: 'category', list: 'categorias-sugeridas', placeholder: 'Trabajo, Estudio, Personal...' },
  }) as HTMLInputElement;
  categoryInput.value = initialTask?.category ?? '';
  const datalist = el('datalist', { attrs: { id: 'categorias-sugeridas' } });
  for (const cat of CATEGORIAS_SUGERIDAS) {
    datalist.append(el('option', { attrs: { value: cat } }));
  }
  categoryGroup.append(categoryLabel, categoryInput, datalist);

  // --- Prioridad ---
  const priorityGroup = el('div', { className: 'field' });
  const priorityLabel = el('span', { className: 'field__legend', text: 'Prioridad' });
  const priorityOptions = el('div', { className: 'priority-picker', attrs: { role: 'radiogroup', 'aria-label': 'Prioridad' } });
  const currentPriority = initialTask?.priority ?? 'media';
  for (const priority of PRIORITIES) {
    const optId = `priority-${priority.value}`;
    const wrap = el('label', { className: `priority-picker__option priority-picker__option--${priority.value}`, attrs: { for: optId } });
    const radio = el('input', {
      attrs: { type: 'radio', id: optId, name: 'priority', value: priority.value },
    }) as HTMLInputElement;
    radio.checked = priority.value === currentPriority;
    const span = el('span', { text: priority.label });
    wrap.append(radio, span);
    priorityOptions.append(wrap);
  }
  priorityGroup.append(priorityLabel, priorityOptions);

  // --- Acciones ---
  const actions = el('div', { className: 'task-form__actions' });
  const cancelBtn = el('button', { className: 'btn btn--ghost', text: 'Cancelar', attrs: { type: 'button' } });
  const submitBtn = el('button', {
    className: 'btn btn--primary',
    text: mode === 'crear' ? 'Agregar tarea' : 'Guardar cambios',
    attrs: { type: 'submit' },
  });
  cancelBtn.addEventListener('click', () => onCancel());
  actions.append(cancelBtn, submitBtn);

  form.append(heading, titleGroup, descGroup, categoryGroup, priorityGroup, actions);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
      titleError.textContent = 'El titulo es obligatorio.';
      titleInput.classList.add('field__input--invalid');
      titleInput.focus();
      return;
    }
    titleError.textContent = '';
    titleInput.classList.remove('field__input--invalid');

    const priorityValue = (form.querySelector('input[name="priority"]:checked') as HTMLInputElement | null)?.value as
      | Priority
      | undefined;

    onSubmit({
      title,
      description: descInput.value.trim(),
      category: categoryInput.value.trim(),
      priority: priorityValue ?? 'media',
    });
  });

  // Autofoco al abrir el formulario.
  queueMicrotask(() => titleInput.focus());

  return form;
}
