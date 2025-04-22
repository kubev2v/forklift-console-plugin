import type { Dispatch, FunctionComponent } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';

import type { PlanCreatePageState } from '../states/PlanCreatePageStore';

import SearchInputProvider from './SearchInputProvider';
import SelectProvider from './SelectProvider';

type FiltersToolbarProvidersProps = {
  filterState: PlanCreatePageState;
  filterDispatch: Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
  className?: string;
};

export const FiltersToolbarProviders: FunctionComponent<FiltersToolbarProvidersProps> = ({
  className,
  filterDispatch,
  filterState,
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
