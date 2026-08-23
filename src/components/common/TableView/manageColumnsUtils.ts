import type { ResourceField } from '../utils/types';

export const filterActionsAndHidden = (resourceFields: ResourceField[]): ResourceField[] =>
  resourceFields.filter((col) => !col.isAction && !col.isHidden && col.resourceFieldId !== null);
