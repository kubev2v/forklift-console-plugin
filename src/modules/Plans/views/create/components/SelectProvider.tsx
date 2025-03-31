import React, {
  type Dispatch,
  type FunctionComponent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  useState,
} from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';

import providerTypes from '../constanats/providerTypes';
import type { PlanCreatePageState } from '../states';

export type SelectProviderProps = {
  filterState: PlanCreatePageState;
  filterDispatch: Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
};

export const SelectProvider: FunctionComponent<SelectProviderProps> = ({
  filterDispatch,
  filterState,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const onSelect = (_event: ReactMouseEvent | undefined, value: string | number | undefined) => {
    const prevTypeFilters = filterState.typeFilters;

    const typeFilters = prevTypeFilters.includes(value as string)
      ? prevTypeFilters.filter((item: string) => item !== value)
      : [...prevTypeFilters, value as string];

    filterDispatch({ payload: typeFilters, type: 'UPDATE_TYPE_FILTERS' });
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullWidth>
      {
        <>
          <FilterIcon alt="filter icon" />
          {t('Type')}
          &nbsp;&nbsp;&nbsp;
        </>
      }
      {filterState.typeFilters.length > 0 && <Badge isRead>{filterState.typeFilters.length}</Badge>}
    </MenuToggle>
  );

  const providerTypesArray = Object.keys(providerTypes);

  const renderOptions = () => {
    return providerTypesArray.map((providerType, index) => (
      <SelectOption
        hasCheckbox
        key={index}
        value={providerType}
        isSelected={filterState.typeFilters.includes(providerType)}
      >
        {providerType}
      </SelectOption>
    ));
  };

  return (
    <div>
      <span id="select-provider-id" hidden>
        Select Provider
      </span>
      <Select
        role="menu"
        aria-label="Select Provider"
        aria-labelledby="select-provider-id"
        isOpen={isOpen}
        selected={filterState.typeFilters}
        onSelect={onSelect}
        onOpenChange={(nextOpen: boolean) => {
          setIsOpen(nextOpen);
        }}
        toggle={toggle}
        shouldFocusToggleOnSelect
        shouldFocusFirstItemOnOpen={false}
        popperProps={{
          direction: 'down',
          enableFlip: true,
        }}
      >
        <SelectList>{renderOptions()}</SelectList>
      </Select>
    </div>
  );
};

export default SelectProvider;
