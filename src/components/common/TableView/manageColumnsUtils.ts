import { localeCompare } from '../utils/localCompare';
import type { ResourceField } from '../utils/types';

export const filterActionsAndHidden = (resourceFields: ResourceField[]): ResourceField[] =>
  resourceFields.filter((col) => !col.isAction && !col.isHidden && col.resourceFieldId !== null);

const visibleColumnIds = (resourceFields: ResourceField[]): string[] =>
  filterActionsAndHidden(resourceFields)
    .filter(({ isVisible }) => isVisible !== false)
    .map(({ resourceFieldId }) => resourceFieldId)
    .filter((id): id is string => Boolean(id))
    .sort((a, b) => localeCompare(a, b, 'en'));

/** True when the same columns are shown, regardless of order. */
export const sameVisibleColumnSet = (a: ResourceField[], b: ResourceField[]): boolean => {
  const idsA = visibleColumnIds(a);
  const idsB = visibleColumnIds(b);
  if (idsA.length !== idsB.length) {
    return false;
  }
  return idsA.every((id, index) => id === idsB[index]);
};

export const sameOrderAndVisibility = (a: ResourceField[], b: ResourceField[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (
      a[i]?.resourceFieldId !== b[i]?.resourceFieldId ||
      Boolean(a[i]?.isVisible) !== Boolean(b[i]?.isVisible)
    ) {
      return false;
    }
  }

  return true;
};
