import type { LabelFields } from './types';

export const labelsArrayToObject = (labels: LabelFields[]): Record<string, string | null> => {
  const result: Record<string, string | null> = {};

  labels.forEach((label) => {
    const { key, value = null } = label;
    result[key] = value;
  });
  return result;
};
