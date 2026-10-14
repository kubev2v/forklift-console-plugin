import { isEmpty } from '@utils/helpers';

import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import type { DefaultColumnWidth } from './defaultColumnWidthTypes';

export const allocateDefaultColumnWidths = (
  availableWidth: number,
  columns: DefaultColumnWidth[],
): number[] => {
  const paddingTotal = columns.reduce((sum, column) => sum + column.padding, 0);
  const preferredTotal = columns.reduce(
    (sum, column) => sum + Math.max(column.minWidth, column.padding),
    0,
  );
  const minimumScale =
    preferredTotal > paddingTotal
      ? Math.min(1, Math.max(0, (availableWidth - paddingTotal) / (preferredTotal - paddingTotal)))
      : 1;
  const minimums = columns.map(
    ({ minWidth, padding }) => padding + (Math.max(minWidth, padding) - padding) * minimumScale,
  );
  const weights = columns.map(({ weight }) => (isValidColumnWidth(weight) ? weight : 1));
  const widths = columns.map(() => 0);
  let remainingWidth = availableWidth;
  let remainingColumns = columns.map((_column, index) => index);

  while (!isEmpty(remainingColumns)) {
    const weightTotal = remainingColumns.reduce((sum, index) => sum + weights[index], 0);
    const widthToDistribute = remainingWidth;
    const constrainedColumns = remainingColumns.filter(
      (index) => (widthToDistribute * weights[index]) / weightTotal < minimums[index],
    );
    if (isEmpty(constrainedColumns)) {
      for (const index of remainingColumns) {
        widths[index] = (remainingWidth * weights[index]) / weightTotal;
      }
      remainingColumns = [];
    } else {
      for (const index of constrainedColumns) {
        widths[index] = minimums[index];
        remainingWidth -= minimums[index];
      }
      remainingColumns = remainingColumns.filter((index) => !constrainedColumns.includes(index));
    }
  }
  return widths;
};
