import React from 'react';

import { FilterDef } from '../../utils';
import { FilterTypeProps } from '../Filter';

import { GlobalFilters } from './types';

interface FilterFromDefProps {
  resourceFieldId: string;
  label: string;
  filterDef: FilterDef;
  selectedFilters: GlobalFilters;
  onFilterUpdate(filters: GlobalFilters): void;
  FilterType: (props: FilterTypeProps) => JSX.Element;
  showFilter?: boolean;
  resolvedLanguage: string;
}

export const FilterFromDef = ({
  resourceFieldId: id,
  label,
  filterDef: def,
  selectedFilters,
  FilterType,
  onFilterUpdate,
  showFilter = true,
  resolvedLanguage,
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
        placeholderLabel={def.placeholderLabel}
        selectedFilters={selectedFilters[id] ?? []}
        title={def?.fieldLabel ?? label}
        showFilter={showFilter}
        supportedValues={def.values}
        supportedGroups={def.groups}
        resolvedLanguage={resolvedLanguage}
      />
    )
  );
};
