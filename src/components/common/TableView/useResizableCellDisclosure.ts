import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { subscribeToTableLayoutChanges } from './resizableCellLayoutEvents';
import { type CellDisclosure, measureCellDisclosure } from './resizableCellUtils';

const EMPTY_DISCLOSURE: CellDisclosure = { clipped: false, interactive: false, text: '' };

type ResizableCellDisclosure = {
  cellRef: RefObject<HTMLTableCellElement>;
  disclosure: CellDisclosure;
  measure: () => CellDisclosure;
};

export const useResizableCellDisclosure = (enabled: boolean): ResizableCellDisclosure => {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const [disclosure, setDisclosure] = useState<CellDisclosure>(EMPTY_DISCLOSURE);

  const measure = useCallback((): CellDisclosure => {
    const cell = cellRef.current;
    if (!cell) {
      return EMPTY_DISCLOSURE;
    }

    const next = measureCellDisclosure(cell);
    setDisclosure((previous) =>
      previous.clipped === next.clipped &&
      previous.interactive === next.interactive &&
      previous.text === next.text
        ? previous
        : next,
    );
    return next;
  }, []);

  useLayoutEffect(() => {
    const cell = cellRef.current;
    if (!enabled || !cell) {
      return undefined;
    }

    measure();
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    resizeObserver?.observe(cell);
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(cell, { characterData: true, childList: true, subtree: true });
    const unsubscribe = subscribeToTableLayoutChanges(measure);

    return (): void => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      unsubscribe();
    };
  }, [enabled, measure]);

  return { cellRef, disclosure, measure };
};
