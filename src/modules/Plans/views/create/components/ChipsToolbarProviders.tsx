import React from 'react';

import { Chip, ChipGroup, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';

import { PlanCreatePageState } from '../states';

export interface ChipsToolbarProvidersProps {
  filterState: PlanCreatePageState;
  filterDispatch: React.Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
}

export const ChipsToolbarProviders: React.FunctionComponent<ChipsToolbarProvidersProps> = ({
  filterState,
  filterDispatch,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteNameFilter = (_) => {
    filterDispatch({ type: 'SET_NAME_FILTER', payload: '' });
  };

  const deleteTypeFilter = (type: string) => {
    filterDispatch({
      type: 'UPDATE_TYPE_FILTERS',
      payload: filterState.typeFilters.filter((t) => t !== type),
    });
  };

  const name = filterState.nameFilter;
  const types = filterState.typeFilters;

  return (
    <Toolbar id="toolbar-with-chip-groups">
      <ToolbarContent>
        {name && (
          <ToolbarItem>
            <ChipGroup categoryName="Name">
              <Chip key={name} onClick={() => deleteNameFilter(name)}>
                {name}
              </Chip>
            </ChipGroup>
          </ToolbarItem>
        )}
        {types && types.length > 0 && (
          <ToolbarItem>
            <ChipGroup categoryName="Types">
              {types.map((type, index) => (
                <Chip key={index} onClick={() => deleteTypeFilter(type)}>
                  {type}
                </Chip>
              ))}
            </ChipGroup>
          </ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};
