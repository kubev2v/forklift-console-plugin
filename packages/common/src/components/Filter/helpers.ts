import { Field } from '../types';

import { FieldFilter } from './types';

export const toFieldFilter = ({
  id: fieldId,
  toLabel: toFieldLabel,
  filter: filterDef,
}: Field): FieldFilter => ({ fieldId, toFieldLabel, filterDef });

export const fromI18nEnum = (i18nEnum: { [k: string]: (t: (k: string) => string) => string }) =>
  Object.entries(i18nEnum).map(([type, toLabel]) => ({ id: type, toLabel }));
