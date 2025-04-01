import React from 'react';

import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';

import { PlanCreatePageState } from '../states/PlanCreatePageStore';
import SearchInputProvider from './SearchInputProvider';
import SelectProvider from './SelectProvider';

interface FiltersToolbarProvidersProps {
  filterState: PlanCreatePageState;
  filterDispatch: React.Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
  className?: string;
}

export const FiltersToolbarProviders: React.FunctionComponent<FiltersToolbarProvidersProps> = ({
  filterState,
  filterDispatch,
  className,
}) => {
  return (
    <Toolbar className={className}>
      <ToolbarContent>
        <>
          <ToolbarItem>
            <SelectProvider filterState={filterState} filterDispatch={filterDispatch} />
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
            <SearchInputProvider filterState={filterState} filterDispatch={filterDispatch} />
          </ToolbarItem>
        </>
      </ToolbarContent>
    </Toolbar>
  );
};
