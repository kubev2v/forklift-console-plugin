import { type PointerEvent, type RefObject, useEffect } from 'react';

import type { DragState } from './columnResizeInputUtils';
import { getHeaderForResizeButton } from './columnResizeInputUtils';
import {
  activateColumnResize,
  captureColumnResizeSession,
  previewColumnResize,
} from './columnResizeSession';
import { RESIZE_DRAG_THRESHOLD_PX } from './dataViewTableConstants';
import { getHeaderMinimumWidth } from './getHeaderMinimumWidth';
import { getEffectiveCssZoom } from './layoutPixelUtils';
import { subscribeToPointerRelease } from './pointerReleaseSubscription';

export const createDragState = (
  event: PointerEvent<HTMLButtonElement>,
  header: HTMLTableCellElement,
  minWidth: number,
): DragState => ({
  button: event.currentTarget,
  lastWidth: null,
  minimum: getHeaderMinimumWidth(header, minWidth),
  pointerId: event.pointerId,
  rtl: getComputedStyle(header).direction === 'rtl',
  session: null,
  startX: event.clientX,
  zoom: getEffectiveCssZoom(header),
});

export const previewPointerResize = (drag: DragState, clientX: number): number | null => {
  const delta = ((clientX - drag.startX) / drag.zoom) * (drag.rtl ? -1 : 1);
  if (!drag.session) {
    if (Math.abs(delta) < RESIZE_DRAG_THRESHOLD_PX) return null;
    const header = getHeaderForResizeButton(drag.button);
    drag.session = header && captureColumnResizeSession(header);
    if (!drag.session) return null;
    activateColumnResize(drag.session);
  }
  const gestureMinimum = Math.min(drag.minimum, drag.session.activeWidth);
  drag.lastWidth = Math.max(gestureMinimum, drag.session.activeWidth + delta);
  previewColumnResize(drag.session, drag.lastWidth);
  return drag.lastWidth;
};

export const usePointerRelease = (
  dragRef: RefObject<DragState | null>,
  cancelDrag: () => void,
  finishDrag: (drag: DragState, clientX: number | null) => void,
): void => {
  useEffect(
    () =>
      subscribeToPointerRelease({
        cancelDrag,
        finishDrag,
        getDrag: () => dragRef.current,
      }),
    [cancelDrag, dragRef, finishDrag],
  );
};
