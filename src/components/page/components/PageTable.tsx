import { type FC, type ReactElement, useMemo } from 'react';

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
  clearAllFilters: () => void;
  customNoResultsFound?: ReactElement;
  customNoResultsMatchFilter?: ReactElement;
  dataOnScreen: T[];
  error: unknown;
  expandedIds?: string[];
  finalFilteredData: T[];
  header: FC<TableViewHeaderProps<T>>;
  loaded: boolean;
  namespace: string;
  RowComponent: FC<RowProps<T>>;
  sortedData: T[];
  title?: string;
  toId?: (item: T) => string;
  visibleColumns: ResourceField[];
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
      activeSort={activeSort}
      aria-label={title ?? t('Page table')}
      currentNamespace={namespace}
      entities={dataOnScreen}
      expandedIds={expandedIds}
      Header={header}
      Row={RowComponent}
      setActiveSort={setActiveSort}
      toId={toId}
      visibleColumns={visibleColumns}
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
            clearAllFilters={clearAllFilters}
            clearAllLabel={t('Clear all filters')}
            description={t(
              'No results match the filter criteria. Clear all filters and try again.',
            )}
            key="no_match"
            title={t('No results found')}
          />
        ))}
    </TableView>
  );
};
