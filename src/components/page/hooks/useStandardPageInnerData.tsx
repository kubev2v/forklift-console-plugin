import { type FC, type ReactElement, useMemo } from 'react';

import type { RowProps } from '@components/common/TableView/types';
import { withTr } from '@components/common/TableView/withTr';
import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';

import { getVisibleColumns, pruneSelectedIds } from '../utils/utils';

type UseStandardPageInnerDataArgs<T> = {
  canSelect?: (item: T) => boolean;
  cell?: FC<RowProps<T>>;
  expanded?: FC<RowProps<T>>;
  fields: ResourceField[];
  finalFilteredData: T[];
  GlobalActionToolbarItems: FC<GlobalActionToolbarProps<T>>[];
  pageData: T[];
  row: FC<RowProps<T>>;
  selectedIds?: string[];
  showPagination: boolean;
  toId?: (item: T) => string;
};

type UseStandardPageInnerDataReturn<T> = {
  dataIds: string[];
  dataOnScreen: T[];
  pageDataIds: string[];
  renderedGlobalActions: ReactElement[];
  RowComponent: FC<RowProps<T>>;
  selectedIds?: string[];
  visibleColumns: ResourceField[];
};

export const useStandardPageInnerData = <T,>({
  canSelect,
  cell,
  expanded,
  fields,
  finalFilteredData,
  GlobalActionToolbarItems,
  pageData,
  row,
  selectedIds,
  showPagination,
  toId,
}: UseStandardPageInnerDataArgs<T>): UseStandardPageInnerDataReturn<T> => {
  const visibleColumns = useMemo(() => getVisibleColumns(fields), [fields]);

  const RowComponent = useMemo(() => (cell ? withTr(cell, expanded) : row), [cell, expanded, row]);

  const dataOnScreen = useMemo(
    () => (showPagination ? pageData : finalFilteredData),
    [showPagination, pageData, finalFilteredData],
  );

  const visibleIds = useMemo(
    () => (finalFilteredData ?? []).map((item) => toId?.(item) ?? ''),
    [finalFilteredData, toId],
  );

  const prunedSelectedIds = useMemo(
    () => (selectedIds ? pruneSelectedIds(selectedIds, visibleIds) : undefined),
    [selectedIds, visibleIds],
  );

  const dataIds = useMemo(
    () =>
      finalFilteredData
        ?.filter((item) => canSelect?.(item) ?? true)
        .map((data) => toId?.(data) ?? ''),
    [finalFilteredData, toId, canSelect],
  );

  const pageDataIds = useMemo(
    () => pageData?.filter((item) => canSelect?.(item) ?? true).map((data) => toId?.(data) ?? ''),
    [pageData, toId, canSelect],
  );

  const renderedGlobalActions = useMemo(() => {
    const seen = new Map<string, number>();

    return GlobalActionToolbarItems.map((Action) => {
      const base = Action.displayName ?? Action.name ?? 'Action';
      const occurrence = seen.get(base) ?? 0;
      seen.set(base, occurrence + 1);
      const key = occurrence === 0 ? base : `${base}__${occurrence}`;

      return <Action dataOnScreen={dataOnScreen} key={key} selectedIds={prunedSelectedIds} />;
    });
  }, [GlobalActionToolbarItems, dataOnScreen, prunedSelectedIds]);

  return {
    dataIds,
    dataOnScreen,
    pageDataIds,
    renderedGlobalActions,
    RowComponent,
    selectedIds: prunedSelectedIds,
    visibleColumns,
  };
};
