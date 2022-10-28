import { Field } from '../types';

import { FieldFilter } from './types';

export const toFieldFilter = ({
  id: fieldId,
  toLabel: toFieldLabel,
  filter: filterDef,
}: Field): FieldFilter => ({ fieldId, toFieldLabel, filterDef });
