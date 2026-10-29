import { createElement, Fragment, useMemo } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { getColumnWidthSpacerProps, toDataViewColumn } from './dataViewColumnUtils';

type UseForkliftDataViewColumnsArgs = {
  activeSort: SortType;
  leadingColumns?: DataViewTh[];
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

export const useForkliftDataViewColumns = ({
  activeSort,
  leadingColumns = [],
  setActiveSort,
  visibleColumns,
}: UseForkliftDataViewColumnsArgs): DataViewTh[] => {
  const { t } = useForkliftTranslation();
  const { getResizeConfig } = useTableColumnWidthContext();
  const actionScreenReaderText = t('Actions');

  return useMemo((): DataViewTh[] => {
    const spacer: DataViewTh = {
      cell: createElement(Fragment),
      props: getColumnWidthSpacerProps(),
    };
    const columns = visibleColumns.flatMap((field, columnIndex) => [
      ...(field.isAction ? [spacer] : []),
      toDataViewColumn({
        actionScreenReaderText,
        activeSort,
        columnIndex,
        field,
        resizeConfig: getResizeConfig(field, field.label),
        setActiveSort,
        visibleColumns,
      }),
    ]);
    return [
      ...leadingColumns,
      ...columns,
      ...(visibleColumns.some((field) => field.isAction) ? [] : [spacer]),
    ];
  }, [
    actionScreenReaderText,
    activeSort,
    getResizeConfig,
    leadingColumns,
    setActiveSort,
    visibleColumns,
  ]);
};
