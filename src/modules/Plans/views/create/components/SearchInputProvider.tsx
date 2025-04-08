import type { Dispatch, FormEvent, FunctionComponent, SyntheticEvent } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SearchInput } from '@patternfly/react-core';

import type { PlanCreatePageState } from '../states/PlanCreatePageStore';

type SearchInputProviderProps = {
  filterState: PlanCreatePageState;
  filterDispatch: Dispatch<{
    type: string;
    payload?: string | string[];
  }>;
};

const SearchInputProvider: FunctionComponent<SearchInputProviderProps> = ({
  filterDispatch,
  filterState,
}) => {
  const { t } = useForkliftTranslation();

  const updateNameFilter = (value: string) => {
    filterDispatch({ payload: value, type: 'SET_NAME_FILTER' });
  };

  const onChange: (event: FormEvent<HTMLInputElement>, value: string) => void = (_event, value) => {
    updateNameFilter(value);
  };

  const onClear: (event: SyntheticEvent<HTMLButtonElement>) => void = () => {
    updateNameFilter('');
  };

  return (
    <div className="forklift--create-plan--search-input-provider">
      <SearchInput
        placeholder={t('Filter provider')}
        value={filterState.nameFilter}
        onChange={onChange}
        onClear={onClear}
      />
    </div>
  );
};

export default SearchInputProvider;
