// cspell:ignore contenteditable
const CLIP_TOLERANCE_PX = 1;
const FOCUSABLE_CONTENT_SELECTOR =
  'a[href], area[href], button, input, select, textarea, summary, [contenteditable], [tabindex]';

export type CellDisclosure = {
  clipped: boolean;
  interactive: boolean;
  text: string;
};

const hasHiddenOverflow = (element: HTMLElement): boolean => {
  if (
    element.scrollWidth - element.clientWidth <= CLIP_TOLERANCE_PX &&
    element.scrollHeight - element.clientHeight <= CLIP_TOLERANCE_PX
  ) {
    return false;
  }

  const { overflow, overflowX, overflowY } = getComputedStyle(element);
  return [overflow, overflowX, overflowY].some((value) =>
    ['auto', 'clip', 'hidden', 'scroll'].includes(value),
  );
};

const isKeyboardFocusable = (element: HTMLElement, cell: HTMLTableCellElement): boolean => {
  if (
    element.matches(':disabled') ||
    (element instanceof HTMLInputElement && element.type === 'hidden') ||
    element.closest('[aria-hidden="true"], [hidden], [inert]')
  ) {
    return false;
  }

  if (element.tabIndex < 0 && (!element.isContentEditable || element.hasAttribute('tabindex'))) {
    return false;
  }

  for (
    let current: HTMLElement | null = element;
    current && current !== cell;
    current = current.parentElement
  ) {
    const { display, visibility } = getComputedStyle(current);
    if (display === 'none' || visibility === 'hidden' || visibility === 'collapse') {
      return false;
    }
  }

  return true;
};

export const measureCellDisclosure = (cell: HTMLTableCellElement): CellDisclosure => ({
  clipped:
    hasHiddenOverflow(cell) ||
    Array.from(cell.querySelectorAll<HTMLElement>('*')).some(hasHiddenOverflow),
  interactive: Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE_CONTENT_SELECTOR)).some(
    (element) => isKeyboardFocusable(element, cell),
  ),
  text: (cell.innerText ?? cell.textContent ?? '').trim(),
});
