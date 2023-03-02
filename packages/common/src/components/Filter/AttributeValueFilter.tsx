import React, { useState } from 'react';
import { useTranslation } from 'common/src/utils/i18n';

import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { FilterFromDef } from './FilterFromDef';
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

      {fieldFilters.map(({ fieldId, toFieldLabel, filterDef }) => (
        <FilterFromDef
          key={fieldId}
          {...{
            fieldId,
            toFieldLabel,
            filterDef,
            onFilterUpdate,
            selectedFilters,
            FilterType: supportedFilterTypes[filterDef.type],
            showFilter: currentFilter?.fieldId === fieldId,
          }}
        />
      ))}
    </ToolbarGroup>
  );
};
