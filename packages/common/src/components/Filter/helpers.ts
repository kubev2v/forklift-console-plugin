import { ResourceField } from '../types';

import { FieldFilter } from './types';

export const toFieldFilter = ({
  resourceFieldID,
  label,
  filter: filterDef,
}: ResourceField): FieldFilter => ({ resourceFieldID, label, filterDef });

export const fromI18nEnum = (i18nEnum: { [k: string]: string }) =>
  Object.entries(i18nEnum).map(([type, label]) => ({ id: type, label }));
