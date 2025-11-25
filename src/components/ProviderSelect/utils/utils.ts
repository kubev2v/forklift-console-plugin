import type { V1beta1Provider } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

const isProvider = (obj: unknown): obj is V1beta1Provider =>
  typeof obj === 'object' &&
  obj !== null &&
  'kind' in obj &&
  (obj as V1beta1Provider).kind === 'Provider';

export const extractProviders = (value: unknown): V1beta1Provider[] => {
  if (!value) return [];

  if (Array.isArray(value) && (isEmpty(value) || isProvider(value[0]))) {
    return value as V1beta1Provider[];
  }

  if (Array.isArray(value)) {
    const innerArray = value.find(
      (entry): entry is V1beta1Provider[] =>
        Array.isArray(entry) && (isEmpty(entry) || isProvider(entry[0])),
    );

    if (innerArray) {
      return innerArray;
    }
  }

  return [];
};
