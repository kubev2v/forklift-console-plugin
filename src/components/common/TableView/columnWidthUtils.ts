import type { ResourceField } from '../utils/types';

import { DEFAULT_COLUMN_MIN_WIDTH_PX, READABLE_COLUMN_MIN_WIDTH_PX } from './columnWidthConstants';

export type ColumnResizeConfig = {
  id: string;
  label: string;
  minWidth: number;
  savedWidth?: number;
};

export const isResizableField = (field: ResourceField): boolean =>
  !field.isAction && Boolean(field.resourceFieldId);

export const isValidColumnWidth = (width: unknown): width is number =>
  typeof width === 'number' && Number.isFinite(width) && width > 0;

export const getMinWidthForField = (field: ResourceField): number => {
  if (field.isAction) {
    return 0;
  }
  const preferredMinimum = field.defaultWidth?.minWidth;
  return Math.max(
    isValidColumnWidth(preferredMinimum) ? preferredMinimum : DEFAULT_COLUMN_MIN_WIDTH_PX,
    READABLE_COLUMN_MIN_WIDTH_PX,
  );
};

export const getTableColumnLayoutKey = (
  resetVersion: number | string,
  columns: ResourceField[],
  controlColumnSignature = '',
): string =>
  JSON.stringify([
    resetVersion,
    controlColumnSignature,
    columns.map(({ resourceFieldId }) => resourceFieldId),
  ]);

export const getColumnResizeConfig = (
  field: ResourceField,
  label: string | null,
  enabled: boolean,
  widths: Record<string, number>,
): ColumnResizeConfig | undefined => {
  if (!enabled || !isResizableField(field) || !field.resourceFieldId) {
    return undefined;
  }
  const id = field.resourceFieldId;
  const savedWidth = widths[id];
  return {
    id,
    label: label ?? id,
    minWidth: getMinWidthForField(field),
    ...(savedWidth === undefined ? {} : { savedWidth }),
  };
};

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

export const getResizableFieldIds = (fields: ResourceField[], visibleOnly: boolean): Set<string> =>
  new Set(
    fields.flatMap((field) =>
      isResizableField(field) &&
      field.resourceFieldId &&
      (!visibleOnly || (field.isVisible && !field.isHidden))
        ? [field.resourceFieldId]
        : [],
    ),
  );

export const hasColumnWidthForIds = (widths: Record<string, number>, ids: Set<string>): boolean =>
  [...ids].some((id) => widths[id] !== undefined);

export const areColumnWidthsEqual = (
  left: Record<string, number>,
  right: Record<string, number>,
): boolean =>
  Object.keys(left).length === Object.keys(right).length &&
  Object.entries(left).every(([id, width]) => right[id] === width);
