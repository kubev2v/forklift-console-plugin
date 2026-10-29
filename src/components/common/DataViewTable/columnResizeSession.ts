import {
  DATA_COLUMN_RESIZE_ACTIVE_ATTR,
  DATA_COLUMN_WIDTH_FIXED_ATTR,
  DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR,
  DATA_RESIZABLE_COLUMN_ATTR,
} from './dataViewTableConstants';
import { getLayoutPixelWidth } from './layoutPixelUtils';

type HeaderSnapshot = {
  element: HTMLTableCellElement;
  fixed: string | null;
  id: string;
  maxWidth: string;
  minWidth: string;
  width: number;
};

export type ColumnResizeSession = {
  activeId: string;
  activeWidth: number;
  customized: string | null;
  headers: HeaderSnapshot[];
  resizeActive: string | null;
  table: HTMLTableElement;
};

const restoreAttribute = (element: Element, name: string, value: string | null): void => {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
};

const restoreStyle = (element: HTMLElement, name: string, value: string): void => {
  if (value) {
    element.style.setProperty(name, value);
  } else {
    element.style.removeProperty(name);
  }
};

export const captureColumnResizeSession = (
  activeHeader: HTMLTableCellElement,
): ColumnResizeSession | null => {
  const table = activeHeader.closest('table');
  if (!table || !activeHeader.id) {
    return null;
  }
  const elements = Array.from(
    table.querySelectorAll<HTMLTableCellElement>(`thead th[${DATA_RESIZABLE_COLUMN_ATTR}="true"]`),
  );
  const headers = elements.map((element): HeaderSnapshot => ({
    element,
    fixed: element.getAttribute(DATA_COLUMN_WIDTH_FIXED_ATTR),
    id: element.id,
    maxWidth: element.style.maxWidth,
    minWidth: element.style.minWidth,
    width: getLayoutPixelWidth(element),
  }));
  const active = headers.find(({ element }) => element === activeHeader);
  if (!active || headers.some(({ id, width }) => !id || !Number.isFinite(width) || width <= 0)) {
    return null;
  }
  return {
    activeId: active.id,
    activeWidth: active.width,
    customized: table.getAttribute(DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR),
    headers,
    resizeActive: table.getAttribute(DATA_COLUMN_RESIZE_ACTIVE_ATTR),
    table,
  };
};

export const activateColumnResize = (session: ColumnResizeSession): void => {
  session.table.setAttribute(DATA_COLUMN_RESIZE_ACTIVE_ATTR, 'true');
  session.table.setAttribute(DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR, 'true');
  for (const { element, width } of session.headers) {
    element.style.minWidth = `${width}px`;
    element.style.maxWidth = `${width}px`;
    element.setAttribute(DATA_COLUMN_WIDTH_FIXED_ATTR, 'true');
  }
};

export const previewColumnResize = (session: ColumnResizeSession, width: number): void => {
  const active = session.headers.find(({ id }) => id === session.activeId);
  if (!active) {
    return;
  }
  active.element.style.minWidth = `${width}px`;
  active.element.style.maxWidth = `${width}px`;
};

export const rollbackColumnResize = (session: ColumnResizeSession): void => {
  for (const { element, fixed, maxWidth, minWidth } of session.headers) {
    restoreStyle(element, 'min-width', minWidth);
    restoreStyle(element, 'max-width', maxWidth);
    restoreAttribute(element, DATA_COLUMN_WIDTH_FIXED_ATTR, fixed);
  }
  restoreAttribute(session.table, DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR, session.customized);
  restoreAttribute(session.table, DATA_COLUMN_RESIZE_ACTIVE_ATTR, session.resizeActive);
};

export const completeColumnResize = (
  session: ColumnResizeSession,
  activeWidth: number,
): Record<string, number> => {
  for (const { element } of session.headers) {
    element.style.removeProperty('max-width');
  }
  session.table.removeAttribute(DATA_COLUMN_RESIZE_ACTIVE_ATTR);
  return Object.fromEntries(
    session.headers.map(({ id, width }) => [id, id === session.activeId ? activeWidth : width]),
  );
};
