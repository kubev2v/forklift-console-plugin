import { useMemo } from 'react';

import { toFieldFilter } from '@components/common/FilterGroup/helpers';
import type { FieldFilter } from '@components/common/FilterGroup/types';
import type { ResourceField } from '@components/common/utils/types';

import { isSecondaryAttributeFilter } from '../utils/utils';

type UsePageToolbarFilterFieldsArgs<T> = {
  fields: ResourceField[];
  fieldsMetadata: ResourceField[];
  flatData: T[];
  sortedData: T[];
};

type UsePageToolbarFilterFieldsResult = {
  primaryFilters: FieldFilter[];
  secondaryFilters: FieldFilter[];
  standaloneFilters: FieldFilter[];
};

export const usePageToolbarFilterFields = <T>({
  fields,
  fieldsMetadata,
  flatData,
  sortedData,
}: UsePageToolbarFilterFieldsArgs<T>): UsePageToolbarFilterFieldsResult => {
  const primaryFilters = useMemo(
    () => fields.filter((field) => field.filter?.primary).map(toFieldFilter(sortedData)),
    [fields, sortedData],
  );

  const secondaryFilters = useMemo(
    () => fieldsMetadata.filter(isSecondaryAttributeFilter).map(toFieldFilter(flatData)),
    [fieldsMetadata, flatData],
  );

  const standaloneFilters = useMemo(
    () => fields.filter((field) => field.filter?.standalone).map(toFieldFilter(flatData)),
    [fields, flatData],
  );

  return { primaryFilters, secondaryFilters, standaloneFilters };
};
