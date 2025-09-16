import type { LabelFields } from './types';

export const labelsObjectToArray = (labels: Record<string, string> | undefined): LabelFields[] => {
  return Object.entries(labels ?? {}).map(([key, value], id) => ({ id, key, value }));
};
