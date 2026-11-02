import type { DragState } from './columnResizeInputUtils';

type FinishDrag = (drag: DragState, clientX: number | null) => void;

/**
 * A pointer released outside the 32px handle (or off the window) never reaches the button,
 * so the previewed width was left uncommitted and the column snapped back on the next
 * render. Listen on the window for the whole drag and finish it there too.
 */
export const subscribeToPointerRelease = (
  getDrag: () => DragState | null,
  finishDrag: FinishDrag,
  cancelDrag: () => void,
): (() => void) => {
  const onPointerUp = (event: PointerEvent): void => {
    const drag = getDrag();
    if (drag?.pointerId !== event.pointerId) {
      return;
    }
    finishDrag(drag, event.clientX);
  };
  const onPointerCancel = (): void => {
    cancelDrag();
  };
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);
  return (): void => {
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
  };
};
