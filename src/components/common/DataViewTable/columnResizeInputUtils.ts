import type { FocusEvent, KeyboardEvent, PointerEvent } from 'react';

import type { ColumnResizeSession } from './columnResizeSession';

export type ColumnResizeGestureHandlers = {
  announcedWidth: number | null;
  onFocus: (event: FocusEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
};

export type DragState = {
  button: HTMLButtonElement;
  lastWidth: number | null;
  minimum: number;
  pointerId: number;
  rtl: boolean;
  session: ColumnResizeSession | null;
  startX: number;
  zoom: number;
};

export const getHeaderForResizeButton = (button: HTMLButtonElement): HTMLTableCellElement | null =>
  button.closest('th');

export const releaseColumnResizeCapture = (drag: DragState): void => {
  if (drag.button.hasPointerCapture?.(drag.pointerId)) {
    drag.button.releasePointerCapture(drag.pointerId);
  }
};
