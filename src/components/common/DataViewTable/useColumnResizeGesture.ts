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
  type ColumnResizeGestureHandlers,
  type DragState,
  getHeaderForResizeButton,
  releaseColumnResizeCapture,
} from './columnResizeInputUtils';
import { commitKeyboardResize, isArrowResizeKey, restoreColumnWidth } from './columnResizeKeyboard';
import { createDragState, previewPointerResize } from './columnResizePointer';
import { completeColumnResize, rollbackColumnResize } from './columnResizeSession';
import { getLayoutPixelWidth } from './layoutPixelUtils';

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
  const keyboardStartRef = useRef<number | null>(null);
  const keyboardWidthRef = useRef<number | null>(null);
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
    dragRef.current = createDragState(event, header, minWidth);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    if (previewPointerResize(drag, event.clientX) === null) return;
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
    if (event.key === 'Escape') {
      if (dragRef.current) {
        event.preventDefault();
        cancelDrag();
        return;
      }
      const start = keyboardStartRef.current;
      const { current } = keyboardWidthRef;
      if (start !== null && current !== null && current !== start) {
        event.preventDefault();
        const restored = restoreColumnWidth({
          button: event.currentTarget,
          commitColumnWidths,
          flushPendingColumnWidths,
          width: start,
        });
        if (restored !== null) {
          keyboardWidthRef.current = restored;
          setAnnouncedWidth(restored);
        }
      }
      return;
    }
    if (!isArrowResizeKey(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (dragRef.current) return;
    const width = commitKeyboardResize({
      commitColumnWidths,
      event,
      flushPendingColumnWidths,
      minWidth,
    });
    if (width === null) return;
    keyboardWidthRef.current = width;
    setAnnouncedWidth(width);
  };

  const onFocus = (event: FocusEvent<HTMLButtonElement>): void => {
    const header = getHeaderForResizeButton(event.currentTarget);
    if (!header) return;
    const width = getLayoutPixelWidth(header);
    keyboardStartRef.current = width;
    keyboardWidthRef.current = width;
    setAnnouncedWidth(width);
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
