import type { FC } from 'react';
import { useMemo } from 'react';

import {
  ErrorState,
  Loading,
  NoResultsFound,
  NoResultsMatchFilter,
} from '@components/common/Page/PageStates';
import { TableView } from '@components/common/TableView/TableView';
import type { RowProps, TableViewHeaderProps } from '@components/common/TableView/types';
import type { ResourceField } from '@components/common/utils/types';
import type { TableSortContextProps } from '@components/TableSortContext';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type PageTableProps<T> = {
  dataOnScreen: T[];
  loaded: boolean;
  error: unknown;
  sortedData: T[];
  finalFilteredData: T[];
  visibleColumns: ResourceField[];
  namespace: string;
  title?: string;
  RowComponent: FC<RowProps<T>>;
  header: FC<TableViewHeaderProps<T>>;
  toId?: (item: T) => string;
  expandedIds?: string[];
  customNoResultsFound?: JSX.Element;
  customNoResultsMatchFilter?: JSX.Element;
  clearAllFilters: () => void;
} & TableSortContextProps;

export const PageTable = <T,>({
  activeSort,
  clearAllFilters,
  customNoResultsFound,
  customNoResultsMatchFilter,
  dataOnScreen,
  error,
  expandedIds,
  finalFilteredData,
  header,
  loaded,
  namespace,
  RowComponent,
  setActiveSort,
  sortedData,
  title,
  toId,
  visibleColumns,
}: PageTableProps<T>) => {
  const { t } = useForkliftTranslation();

  const errorFetchingData = useMemo(() => error, [error]);

  const noResults = useMemo(
    () => loaded && !error && isEmpty(sortedData),
    [loaded, error, sortedData],
  );

  const noMatchingResults = useMemo(
    () => loaded && !error && isEmpty(finalFilteredData) && !isEmpty(sortedData),
    [loaded, error, finalFilteredData, sortedData],
  );

  return (
    <TableView<T>
      entities={dataOnScreen}
      visibleColumns={visibleColumns}
      aria-label={title ?? t('Page table')}
      Row={RowComponent}
      Header={header}
      activeSort={activeSort}
      setActiveSort={setActiveSort}
      currentNamespace={namespace}
      toId={toId}
      expandedIds={expandedIds}
    >
      {!loaded && <Loading key="loading" title={t('Loading')} />}

      {loaded && Boolean(errorFetchingData) && (
        <ErrorState key="error" title={t('Unable to retrieve data')} />
      )}

      {noResults &&
        (customNoResultsFound ?? <NoResultsFound key="no_result" title={t('No results found')} />)}

      {noMatchingResults &&
        (customNoResultsMatchFilter ?? (
          <NoResultsMatchFilter
            key="no_match"
            clearAllFilters={clearAllFilters}
            title={t('No results found')}
            description={t(
              'No results match the filter criteria. Clear all filters and try again.',
            )}
            clearAllLabel={t('Clear all filters')}
          />
        ))}
    </TableView>
  );
};
