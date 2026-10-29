import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  RESIZE_COLUMN_WIDTH_INCREMENT,
  RESIZE_COLUMN_WIDTH_SHIFT_INCREMENT,
} from '../TableView/columnWidthConstants';

import {
  type ColumnResizeGestureHandlers,
  type DragState,
  getHeaderForResizeButton,
  releaseColumnResizeCapture,
} from './columnResizeInputUtils';
import {
  activateColumnResize,
  captureColumnResizeSession,
  completeColumnResize,
  previewColumnResize,
  rollbackColumnResize,
} from './columnResizeSession';
import { RESIZE_DRAG_THRESHOLD_PX } from './dataViewTableConstants';
import { getHeaderMinimumWidth } from './getHeaderMinimumWidth';
import { getEffectiveCssZoom, getLayoutPixelWidth } from './layoutPixelUtils';

type UseColumnResizeGestureArgs = {
  commitColumnWidths: (widths: Record<string, number>) => void;
  flushPendingColumnWidths: () => void;
  minWidth: number;
};

export const useColumnResizeGesture = ({
  commitColumnWidths,
  flushPendingColumnWidths,
  minWidth,
}: UseColumnResizeGestureArgs): ColumnResizeGestureHandlers => {
  const dragRef = useRef<DragState | null>(null);
  const [announcedWidth, setAnnouncedWidth] = useState<number | null>(null);

  const cancelDrag = useCallback((): void => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.session) rollbackColumnResize(drag.session);
    releaseColumnResizeCapture(drag);
  }, []);

  useEffect(() => {
    return (): void => {
      cancelDrag();
    };
  }, [cancelDrag]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>): void => {
    if (dragRef.current || event.button !== 0 || !event.isPrimary) return;
    const button = event.currentTarget;
    const header = getHeaderForResizeButton(button);
    if (!header) return;
    event.preventDefault();
    event.stopPropagation();
    button.focus();
    button.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      button,
      lastWidth: null,
      minimum: getHeaderMinimumWidth(header, minWidth),
      pointerId: event.pointerId,
      rtl: getComputedStyle(header).direction === 'rtl',
      session: null,
      startX: event.clientX,
      zoom: getEffectiveCssZoom(header),
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    const delta = ((event.clientX - drag.startX) / drag.zoom) * (drag.rtl ? -1 : 1);
    if (!drag.session && Math.abs(delta) < RESIZE_DRAG_THRESHOLD_PX) return;
    if (!drag.session) {
      const header = getHeaderForResizeButton(drag.button);
      drag.session = header && captureColumnResizeSession(header);
      if (!drag.session) return;
      activateColumnResize(drag.session);
    }
    const gestureMinimum = Math.min(drag.minimum, drag.session.activeWidth);
    drag.lastWidth = Math.max(gestureMinimum, drag.session.activeWidth + delta);
    previewColumnResize(drag.session, drag.lastWidth);
    event.preventDefault();
    event.stopPropagation();
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    onPointerMove(event);
    dragRef.current = null;
    if (drag.session && drag.lastWidth !== null && drag.lastWidth !== drag.session.activeWidth) {
      const widths = completeColumnResize(drag.session, drag.lastWidth);
      setAnnouncedWidth(drag.lastWidth);
      commitColumnWidths(widths);
      flushPendingColumnWidths();
    } else if (drag.session) {
      rollbackColumnResize(drag.session);
    }
    releaseColumnResizeCapture(drag);
    event.preventDefault();
    event.stopPropagation();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Escape' && dragRef.current) {
      event.preventDefault();
      cancelDrag();
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    if (dragRef.current) return;
    const header = getHeaderForResizeButton(event.currentTarget);
    const session = header && captureColumnResizeSession(header);
    if (!header || !session) return;
    const rtl = getComputedStyle(header).direction === 'rtl';
    const sign = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
    const increment = event.shiftKey
      ? RESIZE_COLUMN_WIDTH_SHIFT_INCREMENT
      : RESIZE_COLUMN_WIDTH_INCREMENT;
    const gestureMinimum = Math.min(getHeaderMinimumWidth(header, minWidth), session.activeWidth);
    const width = Math.max(gestureMinimum, session.activeWidth + sign * increment);
    if (width === session.activeWidth) return;
    activateColumnResize(session);
    previewColumnResize(session, width);
    const widths = completeColumnResize(session, width);
    setAnnouncedWidth(width);
    commitColumnWidths(widths);
    flushPendingColumnWidths();
  };

  const onFocus = (event: FocusEvent<HTMLButtonElement>): void => {
    const header = getHeaderForResizeButton(event.currentTarget);
    if (header) setAnnouncedWidth(getLayoutPixelWidth(header));
  };

  return {
    announcedWidth,
    onFocus,
    onKeyDown,
    onLostPointerCapture: cancelDrag,
    onPointerCancel: cancelDrag,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};
