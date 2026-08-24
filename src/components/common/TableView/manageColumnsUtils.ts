import type { ResourceField } from '../utils/types';

export const filterActionsAndHidden = (resourceFields: ResourceField[]): ResourceField[] =>
  resourceFields.filter((col) => !col.isAction && !col.isHidden && col.resourceFieldId !== null);

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
