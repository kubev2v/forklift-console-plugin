import { ResourceField } from '../../utils';

import { FieldFilter } from './types';

export const toFieldFilter =
  (data?: unknown[]): ((field: ResourceField) => FieldFilter) =>
  ({ resourceFieldId, label, filter }: ResourceField): FieldFilter => ({
    resourceFieldId,
    label,
    filterDef: { ...filter, ...filter?.dynamicFilter?.(data ?? []) },
  });

export const EnumToTuple = (i18nEnum: { [k: string]: string }) =>
  Object.entries(i18nEnum).map(([type, label]) => ({ id: type, label }));
