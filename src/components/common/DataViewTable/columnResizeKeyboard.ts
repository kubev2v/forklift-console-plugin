import type { KeyboardEvent } from 'react';

import {
  RESIZE_COLUMN_WIDTH_INCREMENT,
  RESIZE_COLUMN_WIDTH_SHIFT_INCREMENT,
} from '../TableView/columnWidthConstants';

import { getHeaderForResizeButton } from './columnResizeInputUtils';
import {
  activateColumnResize,
  captureColumnResizeSession,
  completeColumnResize,
  previewColumnResize,
} from './columnResizeSession';
import { getHeaderMinimumWidth } from './getHeaderMinimumWidth';

type ColumnWidthCommitter = {
  commitColumnWidths: (widths: Record<string, number>) => void;
  flushPendingColumnWidths: () => void;
};

type KeyboardResizeArgs = ColumnWidthCommitter & {
  event: KeyboardEvent<HTMLButtonElement>;
  minWidth: number;
};

type RestoreWidthArgs = ColumnWidthCommitter & {
  button: HTMLButtonElement;
  width: number;
};

export const isArrowResizeKey = (key: string): boolean =>
  key === 'ArrowLeft' || key === 'ArrowRight';

const applyWidth = (
  button: HTMLButtonElement,
  width: number,
  { commitColumnWidths, flushPendingColumnWidths }: ColumnWidthCommitter,
): number | null => {
  const header = getHeaderForResizeButton(button);
  const session = header && captureColumnResizeSession(header);
  if (!header || !session) return null;
  activateColumnResize(session);
  previewColumnResize(session, width);
  commitColumnWidths(completeColumnResize(session, width));
  flushPendingColumnWidths();
  return width;
};

export const commitKeyboardResize = ({
  commitColumnWidths,
  event,
  flushPendingColumnWidths,
  minWidth,
}: KeyboardResizeArgs): number | null => {
  const button = event.currentTarget;
  const header = getHeaderForResizeButton(button);
  if (!header) return null;
  const session = captureColumnResizeSession(header);
  if (!session) return null;
  const rtl = getComputedStyle(header).direction === 'rtl';
  const sign = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
  const increment = event.shiftKey
    ? RESIZE_COLUMN_WIDTH_SHIFT_INCREMENT
    : RESIZE_COLUMN_WIDTH_INCREMENT;
  const gestureMinimum = Math.min(getHeaderMinimumWidth(header, minWidth), session.activeWidth);
  const width = Math.max(gestureMinimum, session.activeWidth + sign * increment);
  if (width === session.activeWidth) return width;
  activateColumnResize(session);
  previewColumnResize(session, width);
  commitColumnWidths(completeColumnResize(session, width));
  flushPendingColumnWidths();
  return width;
};

export const restoreColumnWidth = ({
  button,
  commitColumnWidths,
  flushPendingColumnWidths,
  width,
}: RestoreWidthArgs): number | null =>
  applyWidth(button, width, { commitColumnWidths, flushPendingColumnWidths });
