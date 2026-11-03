import type { DragState } from './columnResizeInputUtils';

type PointerReleaseListener = {
  cancelDrag: () => void;
  finishDrag: (drag: DragState, clientX: number | null) => void;
  getDrag: () => DragState | null;
};

const listeners = new Set<PointerReleaseListener>();

/**
 * Capture phase on purpose: a header or an ancestor that stops `pointerup` from bubbling
 * (PatternFly menus, modals) would otherwise leave the table frozen in
 * `data-column-resize-active` after a release outside the handle.
 */
const onPointerUp = (event: PointerEvent): void => {
  for (const listener of listeners) {
    const drag = listener.getDrag();
    if (drag?.pointerId === event.pointerId) {
      listener.finishDrag(drag, event.clientX);
    }
  }
};

const onPointerCancel = (event: PointerEvent): void => {
  for (const listener of listeners) {
    if (listener.getDrag()?.pointerId === event.pointerId) {
      listener.cancelDrag();
    }
  }
};

/**
 * One window subscription shared by every resize handle. A pointer released outside the
 * 32px handle (or off the window) never reaches the button, so the previewed width was
 * left uncommitted and the column snapped back on the next render.
 */
export const subscribeToPointerRelease = (listener: PointerReleaseListener): (() => void) => {
  if (listeners.size === 0) {
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerCancel, true);
  }
  listeners.add(listener);

  return (): void => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('pointercancel', onPointerCancel, true);
    }
  };
};
