import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import {
  DATA_ACTION_COLUMN_ATTR,
  DATA_COLUMN_WIDTH_SPACER_ATTR,
  DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR,
  DATA_CONTROL_COLUMN_ATTR,
  DATA_RESIZABLE_COLUMN_ATTR,
  EXPANSION_COLUMN_WIDTH,
  SELECTION_COLUMN_WIDTH,
} from './dataViewTableConstants';
import { getLayoutPixelWidth } from './layoutPixelUtils';

type MeasuredHeaders = {
  all: HTMLTableCellElement[];
  controls: HTMLTableCellElement[];
  data: HTMLTableCellElement[];
};

export const parsePx = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getActionControl = (
  header: HTMLTableCellElement,
): { button: HTMLButtonElement; cell: HTMLTableCellElement } | null => {
  if (!header.hasAttribute(DATA_ACTION_COLUMN_ATTR)) {
    return null;
  }
  const headerButton = header.querySelector<HTMLButtonElement>('button');
  if (headerButton) {
    return { button: headerButton, cell: header };
  }
  const rows = Array.from(header.closest('table')?.tBodies ?? []).flatMap((body) =>
    Array.from(body.rows),
  );
  for (const row of rows) {
    for (const cell of Array.from(row.cells)) {
      if (cell.dataset.columnId === header.id) {
        const button = cell.querySelector<HTMLButtonElement>('button');
        if (button) {
          return { button, cell };
        }
      }
    }
  }
  return null;
};

export const measureTableHeaders = (table: HTMLTableElement): MeasuredHeaders =>
  Array.from(table.tHead?.rows[0]?.cells ?? []).reduce<MeasuredHeaders>(
    (acc, header) => {
      if (header.hasAttribute(DATA_COLUMN_WIDTH_SPACER_ATTR)) {
        if (table.getAttribute(DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR) === 'true') {
          acc.all.push(header);
        }
        return acc;
      }
      acc.all.push(header);
      if (header.getAttribute(DATA_RESIZABLE_COLUMN_ATTR) === 'true') {
        acc.data.push(header);
      } else {
        acc.controls.push(header);
      }
      return acc;
    },
    { all: [], controls: [], data: [] },
  );

export const getControlColumnWidth = (header: HTMLTableCellElement): number => {
  const controlType = header.getAttribute(DATA_CONTROL_COLUMN_ATTR);
  if (controlType === 'expand') {
    return parsePx(EXPANSION_COLUMN_WIDTH);
  }
  if (controlType === 'select') {
    return parsePx(SELECTION_COLUMN_WIDTH);
  }
  if (header.hasAttribute(DATA_ACTION_COLUMN_ATTR)) {
    const actionControl = getActionControl(header);
    if (actionControl) {
      const style = getComputedStyle(actionControl.cell);
      return (
        getLayoutPixelWidth(actionControl.button) +
        parsePx(style.paddingInlineStart) +
        parsePx(style.paddingInlineEnd)
      );
    }
    const style = getComputedStyle(header);
    // An empty Actions header can absorb table space, so its live width is not intrinsic.
    return Math.max(
      parsePx(style.minWidth),
      parsePx(style.paddingInlineStart) +
        parsePx(style.paddingInlineEnd) +
        parsePx(style.borderInlineStartWidth) +
        parsePx(style.borderInlineEndWidth),
    );
  }
  return getLayoutPixelWidth(header);
};

export const getFixedWidth = (header: HTMLTableCellElement): number => {
  const minWidth = parsePx(header.style.minWidth);
  return isValidColumnWidth(minWidth) ? minWidth : getLayoutPixelWidth(header);
};
