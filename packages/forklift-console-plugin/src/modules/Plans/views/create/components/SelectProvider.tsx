import React, { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';

import providerTypes from '../constanats/providerTypes';
import { PlanCreatePageState } from '../states';

export interface SelectProviderProps {
  filterState: PlanCreatePageState;
  filterDispatch: React.Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
}

export const SelectProvider: React.FunctionComponent<SelectProviderProps> = ({
  filterState,
  filterDispatch,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const providerTypesArray = Object.keys(providerTypes);

  const onSelect = (_, selection: string) => {
    const prevTypeFilters = filterState.typeFilters;
    const typeFilters = prevTypeFilters.includes(selection)
      ? prevTypeFilters.filter((item: string) => item !== selection)
      : [...prevTypeFilters, selection];
    filterDispatch({ type: 'UPDATE_TYPE_FILTERS', payload: typeFilters });
  };

  const renderOptions = () => {
    return providerTypesArray.map((providerType, index) => (
      <SelectOption key={index} value={providerType} />
    ));
  };

  return (
    <div>
      <span id="select-provider-id" hidden>
        Select Provider
      </span>
      <Select
        variant={SelectVariant.checkbox}
        aria-label="Select Provider"
        onToggle={onToggle}
        onSelect={onSelect}
        selections={filterState.typeFilters}
        isOpen={isOpen}
        placeholderText={
          <>
            <FilterIcon alt="filter icon" />
            {t('Type')}
          </>
        }
        aria-labelledby="select-provider-id"
      >
        {renderOptions()}
      </Select>
    </div>
  );
};

export default SelectProvider;
