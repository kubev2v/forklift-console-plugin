import React, { useState } from 'react';
import { useTranslation } from 'src/internal/i18n';

import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { MetaFilterProps } from './types';

interface IdOption extends SelectOptionObject {
  id: string;
}

const toSelectOption = (id: string, label: string): IdOption => ({
  id,
  compareTo: (other: IdOption): boolean => id === other?.id,
  toString: () => label,
});

/**
 * Implementation of PatternFly 4 attribute-value filter pattern.
 * Accepts any filter matching FilterTypeProps interface.
 *
 * @see FilterTypeProps
 */
export const AttributeValueFilter = ({
  selectedFilters,
  onFilterUpdate,
  fieldFilters,
  supportedFilterTypes = {},
}: MetaFilterProps) => {
  const { t } = useTranslation();
  const [currentFilter, setCurrentFilter] = useState(fieldFilters?.[0]);
  const [expanded, setExpanded] = useState(false);

  const selectOptionToFilter = (selectedId) =>
    fieldFilters.find(({ fieldId }) => fieldId === selectedId) ?? currentFilter;

  const onFilterTypeSelect = (event, value, isPlaceholder) => {
    if (!isPlaceholder) {
      setCurrentFilter(selectOptionToFilter(value?.id));
      setExpanded(!expanded);
    }
  };

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        <Select
          onSelect={onFilterTypeSelect}
          onToggle={setExpanded}
          isOpen={expanded}
          variant={SelectVariant.single}
          aria-label={t('Select Filter')}
          selections={
            currentFilter && toSelectOption(currentFilter.fieldId, currentFilter.toFieldLabel(t))
          }
        >
          {fieldFilters.map(({ fieldId, toFieldLabel }) => (
            <SelectOption key={fieldId} value={toSelectOption(fieldId, toFieldLabel(t))} />
          ))}
        </Select>
      </ToolbarItem>

      {fieldFilters.map(({ fieldId: id, toFieldLabel, filterDef: filter }) => {
        const FilterType = supportedFilterTypes[filter.type];
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
              placeholderLabel={filter.toPlaceholderLabel(t)}
              selectedFilters={selectedFilters[id] ?? []}
              showFilter={currentFilter?.fieldId === id}
              title={filter?.toLabel?.(t) ?? toFieldLabel(t)}
              supportedValues={filter.values}
            />
          )
        );
      })}
    </ToolbarGroup>
  );
};
