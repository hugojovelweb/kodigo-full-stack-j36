import { el } from '../utils/dom';

interface Stats {
  total: number;
  completadas: number;
  pendientes: number;
}

export function renderStats(stats: Stats): HTMLElement {
  const wrap = el('div', { className: 'stats' });

  const items: { label: string; value: number; modifier: string }[] = [
    { label: 'Total', value: stats.total, modifier: 'total' },
    { label: 'Pendientes', value: stats.pendientes, modifier: 'pendientes' },
    { label: 'Completadas', value: stats.completadas, modifier: 'completadas' },
  ];

  for (const item of items) {
    const card = el('div', { className: `stats__item stats__item--${item.modifier}` });
    card.append(
      el('span', { className: 'stats__value', text: String(item.value) }),
      el('span', { className: 'stats__label', text: item.label }),
    );
    wrap.append(card);
  }

  return wrap;
}
