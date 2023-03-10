import React from 'react';

import { FilterDef, FilterTypeProps, GlobalFilters } from './types';

interface FilterFromDefProps {
  resourceFieldID: string;
  label: string;
  filterDef: FilterDef;
  selectedFilters: GlobalFilters;
  onFilterUpdate(filters: GlobalFilters): void;
  FilterType: (props: FilterTypeProps) => JSX.Element;
  showFilter?: boolean;
}

export const FilterFromDef = ({
  resourceFieldID: id,
  label,
  filterDef: def,
  selectedFilters,
  FilterType,
  onFilterUpdate,
  showFilter = true,
}: FilterFromDefProps) => {
  return (
    FilterType && (
      <FilterType
        key={id}
        filterId={id}
        onFilterUpdate={(values) =>
          onFilterUpdate({
            ...selectedFilters,
            [id]: values,
          })
        }
        placeholderLabel={def.toPlaceholderLabel}
        selectedFilters={selectedFilters[id] ?? []}
        title={def?.label ?? label}
        showFilter={showFilter}
        supportedValues={def.values}
        supportedGroups={def.groups}
      />
    )
  );
};
