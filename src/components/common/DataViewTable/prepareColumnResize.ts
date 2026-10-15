import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import {
  DATA_DEFAULT_COLUMN_WIDTHS_ATTR,
  DATA_RESIZABLE_COLUMN_ATTR,
} from './dataViewTableConstants';

type ColumnResizeEvent =
  | KeyboardEvent<HTMLTableCellElement>
  | MouseEvent<HTMLTableCellElement>
  | TouchEvent<HTMLTableCellElement>;

export const prepareColumnResize = (
  event: ColumnResizeEvent,
  resizeButtonLabel?: string,
  captureColumnWidths?: (widths: Record<string, number>) => void,
): void => {
  if ('key' in event && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return;
  }
  const { target } = event;
  if (
    !(target instanceof Element) ||
    !resizeButtonLabel ||
    target.closest('button')?.getAttribute('aria-label') !== resizeButtonLabel
  ) {
    return;
  }

  const table = event.currentTarget.closest('table');
  const row = event.currentTarget.parentElement;
  const headers = Array.from(
    row?.querySelectorAll<HTMLTableCellElement>(`th[${DATA_RESIZABLE_COLUMN_ATTR}="true"]`) ?? [],
  );
  // Auto layout redistributes spare space after shrinking. Rebase resizable minimums before
  // PatternFly calculates the drag offset so the first move does not add that space twice.
  const widths = headers.map((header) => header.getBoundingClientRect().width);
  captureColumnWidths?.(
    Object.fromEntries(
      headers.flatMap((header, index) => (header.id ? [[header.id, widths[index]]] : [])),
    ),
  );
  for (const [index, header] of headers.entries()) {
    const width = widths[index];
    header.style.minWidth = `${width}px`;
    if (header !== event.currentTarget) {
      header.style.maxWidth = `${width}px`;
    }
    header.setAttribute('data-column-width-fixed', 'true');
  }

  table?.querySelector(`colgroup[${DATA_DEFAULT_COLUMN_WIDTHS_ATTR}="true"]`)?.remove();
  table?.setAttribute('data-column-widths-customized', 'true');
};
