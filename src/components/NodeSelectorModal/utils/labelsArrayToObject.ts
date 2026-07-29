import type { LabelFields } from './types';

export const labelsArrayToObject = (labels: LabelFields[]): Record<string, string | null> => {
  const result: Record<string, string | null> = {};

  for (const label of labels) {
    const { key, value = null } = label;
    result[key] = value;
  }
  return result;
};
