import { el } from '../utils/dom';

/**
 * Muestra un dialogo modal de confirmacion y devuelve una Promise<boolean>.
 * Se usa antes de eliminar una tarea, tal como pide la actividad
 * ("Eliminar tareas con confirmacion previa").
 */
export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = el('div', { className: 'dialog-overlay' });
    const dialog = el('div', { className: 'dialog', attrs: { role: 'alertdialog', 'aria-modal': 'true' } });

    const text = el('p', { className: 'dialog__message', text: message });
    const actions = el('div', { className: 'dialog__actions' });

    const cancelBtn = el('button', { className: 'btn btn--ghost', text: 'Cancelar', attrs: { type: 'button' } });
    const confirmBtn = el('button', { className: 'btn btn--danger', text: 'Eliminar', attrs: { type: 'button' } });

    function close(result: boolean) {
      document.body.classList.remove('has-dialog');
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
      resolve(result);
    }

    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') close(false);
    }

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(false);
    });
    document.addEventListener('keydown', onKeydown);

    actions.append(cancelBtn, confirmBtn);
    dialog.append(text, actions);
    overlay.append(dialog);
    document.body.classList.add('has-dialog');
    document.body.append(overlay);
    confirmBtn.focus();
  });
}
