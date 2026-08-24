import { type FC, type ReactElement, useMemo } from 'react';

import type { RowProps } from '@components/common/TableView/types';
import { withTr } from '@components/common/TableView/withTr';
import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';

import { getVisibleColumns } from '../utils/utils';

type UseStandardPageInnerDataArgs<T> = {
  canSelect?: (item: T) => boolean;
  cell?: FC<RowProps<T>>;
  expanded?: FC<RowProps<T>>;
  fields: ResourceField[];
  finalFilteredData: T[];
  GlobalActionToolbarItems: FC<GlobalActionToolbarProps<T>>[];
  pageData: T[];
  row: FC<RowProps<T>>;
  showPagination: boolean;
  toId?: (item: T) => string;
};

type UseStandardPageInnerDataReturn<T> = {
  dataIds: string[];
  dataOnScreen: T[];
  pageDataIds: string[];
  renderedGlobalActions: ReactElement[];
  RowComponent: FC<RowProps<T>>;
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
  showPagination,
  toId,
}: UseStandardPageInnerDataArgs<T>): UseStandardPageInnerDataReturn<T> => {
  const visibleColumns = useMemo(() => getVisibleColumns(fields), [fields]);

  const RowComponent = cell ? withTr(cell, expanded) : row;

  const dataOnScreen = useMemo(
    () => (showPagination ? pageData : finalFilteredData),
    [showPagination, pageData, finalFilteredData],
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

  const renderedGlobalActions = useMemo(
    () =>
      GlobalActionToolbarItems.map((Action, index) => (
        <Action dataOnScreen={dataOnScreen} key={`${Action.name}-${index}`} />
      )),
    [GlobalActionToolbarItems, dataOnScreen],
  );

  return {
    dataIds,
    dataOnScreen,
    pageDataIds,
    renderedGlobalActions,
    RowComponent,
    visibleColumns,
  };
};
