import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

type ColumnResizeEvent =
  | KeyboardEvent<HTMLTableCellElement>
  | MouseEvent<HTMLTableCellElement>
  | TouchEvent<HTMLTableCellElement>;

export const prepareColumnResize = (event: ColumnResizeEvent, resizeButtonLabel?: string): void => {
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

  const headers = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLTableCellElement>(
      'th[data-resizable-column="true"]',
    ) ?? [],
  );
  // Auto layout redistributes spare space after shrinking. Rebase resizable minimums before
  // PatternFly calculates the drag offset so the first move does not add that space twice.
  const widths = headers.map((header) => header.getBoundingClientRect().width);
  for (const [index, header] of headers.entries()) {
    header.style.minWidth = `${widths[index]}px`;
    header.setAttribute('data-column-width-fixed', 'true');
  }
  event.currentTarget.closest('table')?.setAttribute('data-column-widths-customized', 'true');
};
