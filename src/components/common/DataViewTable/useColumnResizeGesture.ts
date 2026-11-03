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
import { createDragState, previewPointerResize, usePointerRelease } from './columnResizePointer';
import { finishColumnResize, rollbackColumnResize } from './columnResizeSession';
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

  const finishDrag = useCallback(
    (drag: DragState, clientX: number | null): void => {
      if (dragRef.current !== drag) {
        return;
      }
      if (clientX !== null) {
        previewPointerResize(drag, clientX);
      }
      dragRef.current = null;
      finishColumnResize(drag, commitColumnWidths, flushPendingColumnWidths, setAnnouncedWidth);
      releaseColumnResizeCapture(drag);
    },
    [commitColumnWidths, flushPendingColumnWidths],
  );

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    finishDrag(drag, event.clientX);
  };

  usePointerRelease(dragRef, cancelDrag, finishDrag);

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

  /**
   * Re-rendering or unmounting the handle can drop pointer capture mid-gesture. Reverting
   * there threw away a drag the user had already made; commit what was dragged instead.
   */
  const onLostPointerCapture = (): void => {
    const drag = dragRef.current;
    if (drag) finishDrag(drag, null);
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
    onLostPointerCapture,
    onPointerCancel: cancelDrag,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};
