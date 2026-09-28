/**
 * Pequenas utilidades para crear y consultar elementos del DOM
 * sin depender de ninguna libreria externa.
 */

type AttrMap = Record<string, string>;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: {
    className?: string;
    text?: string;
    html?: string;
    attrs?: AttrMap;
  } = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.html !== undefined) element.innerHTML = options.html;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      element.setAttribute(key, value);
    }
  }
  return element;
}

export function qs<T extends HTMLElement>(selector: string, scope: ParentNode = document): T {
  const found = scope.querySelector<T>(selector);
  if (!found) {
    throw new Error(`No se encontro el elemento para el selector: ${selector}`);
  }
  return found;
}

export function clearChildren(node: HTMLElement): void {
  node.innerHTML = '';
}

/** Escapa texto simple para insertarlo de forma segura dentro de innerHTML. */
export function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/** Formatea una fecha ISO a un texto corto y legible en espanol. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
