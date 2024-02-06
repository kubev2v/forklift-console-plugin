import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SearchInput } from '@patternfly/react-core';

import { PlanCreatePageState } from '../states';

export interface SearchInputProviderProps {
  filterState: PlanCreatePageState;
  filterDispatch: React.Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
}

export const SearchInputProvider: React.FunctionComponent<SearchInputProviderProps> = ({
  filterState,
  filterDispatch,
}) => {
  const { t } = useForkliftTranslation();

  const updateNameFilter = (value: string) => {
    filterDispatch({ type: 'SET_NAME_FILTER', payload: value });
  };

  return (
    <div className="forklift--create-plan--search-input-provider">
      <SearchInput
        placeholder={t('Filter provider')}
        value={filterState.nameFilter}
        onChange={(_, value) => updateNameFilter(value)}
        onClear={() => updateNameFilter('')}
      />
    </div>
  );
};

export default SearchInputProvider;
