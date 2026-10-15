import type { ReactElement, ReactNode } from 'react';

import {
  ErrorState,
  Loading,
  NoResultsFound,
  NoResultsMatchFilter,
} from '@components/common/Page/PageStates';

type PageTablePlaceholderArgs = {
  clearAllFilters: () => void;
  customNoResultsFound?: ReactElement;
  customNoResultsMatchFilter?: ReactElement;
  errorFetchingData: unknown;
  loaded: boolean;
  noMatchingResults: boolean;
  noResults: boolean;
  t: (key: string) => string;
};

export const buildPageTablePlaceholder = ({
  clearAllFilters,
  customNoResultsFound,
  customNoResultsMatchFilter,
  errorFetchingData,
  loaded,
  noMatchingResults,
  noResults,
  t,
}: PageTablePlaceholderArgs): ReactNode => {
  if (!loaded) {
    return <Loading title={t('Loading')} />;
  }
  if (errorFetchingData) {
    return <ErrorState title={t('Unable to retrieve data')} />;
  }
  if (noResults) {
    return customNoResultsFound ?? <NoResultsFound title={t('No results found')} />;
  }
  if (noMatchingResults) {
    return (
      customNoResultsMatchFilter ?? (
        <NoResultsMatchFilter
          clearAllFilters={clearAllFilters}
          clearAllLabel={t('Clear all filters')}
          description={t('No results match the filter criteria. Clear all filters and try again.')}
          title={t('No results found')}
        />
      )
    );
  }
  return null;
};
