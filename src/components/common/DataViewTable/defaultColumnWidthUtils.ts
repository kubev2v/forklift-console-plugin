import { isEmpty } from '@utils/helpers';

import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import type { DefaultColumnWidth } from './defaultColumnWidthTypes';

const distributeRemaining = (
  indices: readonly number[],
  remainingWidth: number,
  minimums: readonly number[],
  weights: readonly number[],
  widths: number[],
): void => {
  if (isEmpty(indices)) {
    return;
  }
  const weightTotal = indices.reduce((sum, index) => sum + weights[index], 0);
  const constrained = indices.filter(
    (index) => (remainingWidth * weights[index]) / weightTotal < minimums[index],
  );
  if (isEmpty(constrained)) {
    for (const index of indices) {
      widths[index] = (remainingWidth * weights[index]) / weightTotal;
    }
    return;
  }
  const constrainedTotal = constrained.reduce((sum, index) => {
    widths[index] = minimums[index];
    return sum + minimums[index];
  }, 0);
  const unconstrained = indices.filter((index) => !constrained.includes(index));
  distributeRemaining(unconstrained, remainingWidth - constrainedTotal, minimums, weights, widths);
};

export const allocateDefaultColumnWidths = (
  availableWidth: number,
  columns: DefaultColumnWidth[],
): number[] => {
  const minimums = columns.map(({ minWidth, padding }) => Math.max(minWidth, padding));
  if (
    !Number.isFinite(availableWidth) ||
    minimums.reduce((sum, width) => sum + width, 0) >= availableWidth
  ) {
    return minimums;
  }
  const weights = columns.map(({ weight }) => (isValidColumnWidth(weight) ? weight : 1));
  const widths = columns.map(() => 0);
  distributeRemaining(
    columns.map((_column, index) => index),
    availableWidth,
    minimums,
    weights,
    widths,
  );
  return widths;
};
