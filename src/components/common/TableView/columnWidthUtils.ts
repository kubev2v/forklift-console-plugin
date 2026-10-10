import type { ResourceField } from '../utils/types';

import {
  ACTION_COLUMN_WIDTH_PX,
  DEFAULT_COLUMN_MAX_WIDTH_PX,
  DEFAULT_COLUMN_MIN_WIDTH_PX,
  TABLE_REFERENCE_WIDTH_PX,
} from './columnWidthConstants';

export const isResizableField = (field: ResourceField): boolean =>
  !field.isAction && Boolean(field.resourceFieldId);

export const getMinWidthForField = (field: ResourceField): number => {
  if (field.isAction) {
    return ACTION_COLUMN_WIDTH_PX;
  }
  return DEFAULT_COLUMN_MIN_WIDTH_PX;
};

export const getDefaultWidthForField = (
  field: ResourceField,
  visibleColumnCount: number,
): number => {
  if (field.isAction) {
    return ACTION_COLUMN_WIDTH_PX;
  }
  if (field.width) {
    return Math.round((field.width / 100) * TABLE_REFERENCE_WIDTH_PX);
  }
  const share = Math.floor(TABLE_REFERENCE_WIDTH_PX / Math.max(visibleColumnCount, 1));
  return Math.max(DEFAULT_COLUMN_MIN_WIDTH_PX, share);
};

export const clampColumnWidth = (width: number, minWidth: number): number =>
  Math.min(DEFAULT_COLUMN_MAX_WIDTH_PX, Math.max(minWidth, width));

export const sanitizeColumnWidths = (columnWidths: unknown): Record<string, number> => {
  if (!columnWidths || typeof columnWidths !== 'object') {
    return {};
  }
  return Object.entries(columnWidths as Record<string, unknown>).reduce<Record<string, number>>(
    (acc, [key, value]) => {
      if (typeof key === 'string' && typeof value === 'number' && Number.isFinite(value)) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );
};
