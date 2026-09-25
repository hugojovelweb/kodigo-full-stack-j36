import type { PriorityFilter, StatusFilter, TaskFilters } from '../types/task.types';
import { el } from '../utils/dom';

interface FilterBarCallbacks {
  onSearch: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onPriorityChange: (value: PriorityFilter) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'completadas', label: 'Completadas' },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'todas', label: 'Cualquier prioridad' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export function renderFilterBar(filters: TaskFilters, callbacks: FilterBarCallbacks): HTMLElement {
  const wrapper = el('div', { className: 'filter-bar' });

  // --- Buscador ---
  const searchWrap = el('div', { className: 'filter-bar__search' });
  const searchIcon = el('span', { className: 'filter-bar__search-icon', attrs: { 'aria-hidden': 'true' }, text: '⌕' });
  const searchInput = el('input', {
    className: 'filter-bar__search-input',
    attrs: {
      type: 'search',
      placeholder: 'Buscar tarea por titulo...',
      'aria-label': 'Buscar tarea por titulo',
    },
  }) as HTMLInputElement;
  searchInput.value = filters.search;
  searchInput.addEventListener('input', () => callbacks.onSearch(searchInput.value));
  searchWrap.append(searchIcon, searchInput);

  // --- Estado (pestañas tipo segmented control) ---
  const statusGroup = el('div', { className: 'filter-bar__segmented', attrs: { role: 'group', 'aria-label': 'Filtrar por estado' } });
  for (const option of STATUS_OPTIONS) {
    const btn = el('button', {
      className: `segmented__btn${filters.status === option.value ? ' is-active' : ''}`,
      text: option.label,
      attrs: { type: 'button', 'aria-pressed': String(filters.status === option.value) },
    });
    btn.addEventListener('click', () => callbacks.onStatusChange(option.value));
    statusGroup.append(btn);
  }

  // --- Prioridad ---
  const prioritySelect = el('select', {
    className: 'filter-bar__select',
    attrs: { 'aria-label': 'Filtrar por prioridad' },
  }) as HTMLSelectElement;
  for (const option of PRIORITY_OPTIONS) {
    const opt = el('option', { text: option.label, attrs: { value: option.value } }) as HTMLOptionElement;
    if (option.value === filters.priority) opt.selected = true;
    prioritySelect.append(opt);
  }
  prioritySelect.addEventListener('change', () => callbacks.onPriorityChange(prioritySelect.value as PriorityFilter));

  wrapper.append(searchWrap, statusGroup, prioritySelect);
  return wrapper;
}
