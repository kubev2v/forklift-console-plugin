import type { ResourceField } from '../utils/types';

import type { FieldFilter } from './types';

export const toFieldFilter =
  (data?: unknown[]): ((field: ResourceField) => FieldFilter) =>
  ({ filter, label, resourceFieldId }: ResourceField): FieldFilter => ({
    filterDef: { ...filter, ...filter?.dynamicFilter?.(data ?? []) },
    label,
    resourceFieldId,
  });

export const enumToTuple = (i18nEnum: Record<string, string>) =>
  Object.entries(i18nEnum).map(([type, label]) => ({ id: type, label }));
