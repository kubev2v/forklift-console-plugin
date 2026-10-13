import type { ResourceField } from '../utils/types';

import { DEFAULT_COLUMN_MIN_WIDTH_PX } from './columnWidthConstants';

export const isResizableField = (field: ResourceField): boolean =>
  !field.isAction && Boolean(field.resourceFieldId);

export const isValidColumnWidth = (width: unknown): width is number =>
  typeof width === 'number' && Number.isFinite(width) && width > 0;

export const getMinWidthForField = (field: ResourceField): number => {
  if (field.isAction) {
    return 0;
  }
  const preferredMinimum = field.defaultWidth?.minWidth;
  return isValidColumnWidth(preferredMinimum) ? preferredMinimum : DEFAULT_COLUMN_MIN_WIDTH_PX;
};

export const getTableColumnLayoutKey = (resetVersion: number, columns: ResourceField[]): string =>
  JSON.stringify([resetVersion, columns.map(({ resourceFieldId }) => resourceFieldId)]);

export const sanitizeColumnWidths = (columnWidths: unknown): Record<string, number> => {
  if (!columnWidths || typeof columnWidths !== 'object') {
    return {};
  }
  return Object.entries(columnWidths as Record<string, unknown>).reduce<Record<string, number>>(
    (acc, [key, value]) => {
      if (isValidColumnWidth(value)) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );
};
