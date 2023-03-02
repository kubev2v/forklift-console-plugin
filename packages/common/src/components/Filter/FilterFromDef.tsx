import React from 'react';
import { useTranslation } from 'common/src/utils/i18n';

import { FilterDef, FilterTypeProps, GlobalFilters } from './types';

interface FilterFromDefProps {
  fieldId: string;
  toFieldLabel(t: (key: string) => string): string;
  filterDef: FilterDef;
  selectedFilters: GlobalFilters;
  onFilterUpdate(filters: GlobalFilters): void;
  FilterType: (props: FilterTypeProps) => JSX.Element;
  showFilter?: boolean;
}

export const FilterFromDef = ({
  fieldId: id,
  toFieldLabel,
  filterDef: def,
  selectedFilters,
  FilterType,
  onFilterUpdate,
  showFilter = true,
}: FilterFromDefProps) => {
  const { t } = useTranslation();
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
        placeholderLabel={def.toPlaceholderLabel(t)}
        selectedFilters={selectedFilters[id] ?? []}
        title={def?.toLabel?.(t) ?? toFieldLabel(t)}
        showFilter={showFilter}
        supportedValues={def.values}
        supportedGroups={def.groups}
      />
    )
  );
};
