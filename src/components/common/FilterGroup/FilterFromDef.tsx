import { useMemo, useState } from 'react';

import { isEmpty } from '@utils/helpers';

import type { FilterTypeProps } from '../Filter/types';
import type { FilterDef } from '../utils/types';

import type { GlobalFilters } from './types';

type FilterFromDefProps = {
  filterDef: FilterDef;
  FilterType: (props: FilterTypeProps) => JSX.Element;
  label: string;
  onFilterUpdate: (filters: GlobalFilters) => void;
  resolvedLanguage: string;
  resourceFieldId: string;
  selectedFilters: GlobalFilters;
  showFilter?: boolean;
};

export const FilterFromDef = ({
  filterDef: def,
  FilterType,
  label,
  onFilterUpdate,
  resolvedLanguage,
  resourceFieldId,
  selectedFilters,
  showFilter = true,
}: FilterFromDefProps) => {
  const [filterId, setFilterId] = useState(resourceFieldId);

  const selectedFilterValues = useMemo(() => {
    const groupSelectedIds = def.groups?.map((group) => group.groupId);

    if (!resourceFieldId && !isEmpty(groupSelectedIds)) {
      return Object.entries(selectedFilters).reduce(
        (acc: string[], [selectedId, selectedValues]) => {
          if (groupSelectedIds?.includes(selectedId)) {
            return isEmpty(acc) ? selectedValues : acc.concat(selectedValues);
          }

          return acc;
        },
        [],
      );
    }

    return selectedFilters[filterId] ?? [];
  }, [def.groups, filterId, resourceFieldId, selectedFilters]);

  const setSelectedFilters = (values: string[], selectedResourceId?: string) => {
    if (selectedResourceId) {
      setFilterId(selectedResourceId);
    }

    onFilterUpdate({
      ...selectedFilters,
      [selectedResourceId ?? resourceFieldId]: values,
    });
  };

  return !def.isHidden && FilterType ? (
    <FilterType
      filterId={filterId}
      hasMultipleResources={!resourceFieldId && !isEmpty(def.groups)}
      helperText={def.helperText}
      onFilterUpdate={setSelectedFilters}
      placeholderLabel={def.placeholderLabel}
      resolvedLanguage={resolvedLanguage}
      selectedFilters={selectedFilterValues}
      showFilter={showFilter}
      showFilterIcon={def.showFilterIcon}
      supportedGroups={def.groups ?? []}
      supportedValues={def.values}
      title={def?.fieldLabel ?? label}
    />
  ) : null;
};
