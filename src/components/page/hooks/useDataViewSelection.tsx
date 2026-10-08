/* eslint-disable react-refresh/only-export-components -- selection cells are built for DataView rows */
import { useCallback, useMemo } from 'react';

import {
  getExpandHeaderProps,
  getSelectionHeaderProps,
  SELECTION_COLUMN_WIDTH,
} from '@components/common/DataViewTable/dataViewColumnUtils';
import type {
  DataViewTd,
  DataViewTh,
} from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { useForkliftTranslation } from '@utils/i18n';

import SelectDisabledTooltip from '../components/SelectDisabledTooltip';
import { useOptionalPageSelection } from '../context/usePageSelectionContext';

type UseDataViewSelectionResult<T> = {
  getLeadingCells: (entity: T, index: number) => DataViewTd[];
  leadingColumns: DataViewTh[];
  useHybridBody: boolean;
};

export const useDataViewSelection = <T,>(): UseDataViewSelectionResult<T> => {
  const { t } = useForkliftTranslation();
  const selection = useOptionalPageSelection<T>();
  const useHybridBody = Boolean(selection?.config.hasExpansion);

  const leadingColumns = useMemo(() => {
    if (!selection) {
      return [];
    }
    const columns: DataViewTh[] = [];
    if (selection.config.hasExpansion) {
      columns.push({
        cell: '',
        props: getExpandHeaderProps(t('Row expand')),
      });
    }
    if (selection.config.hasSelection) {
      columns.push({
        cell: '',
        props: getSelectionHeaderProps(t('Row select')),
      });
    }
    return columns;
  }, [selection, t]);

  const getLeadingCells = useCallback(
    (entity: T, index: number): DataViewTd[] => {
      if (!selection || useHybridBody || !selection.config.hasSelection) {
        return [];
      }
      const itemId = selection.config.toIdRef.current?.(entity) ?? '';
      const isDisabled = !(selection.config.canSelectRef.current?.(entity) ?? true);
      const reason = isDisabled
        ? selection.config.getSelectDisabledReasonRef.current?.(entity)
        : undefined;
      return [
        {
          cell: reason ? (
            <SelectDisabledTooltip reason={reason} rowKey={itemId || String(index)} />
          ) : (
            ''
          ),
          props: {
            'data-testid': `row-select-checkbox-${itemId || index}`,
            isStickyColumn: true,
            select: {
              isDisabled,
              isSelected: selection.state.selectedIds?.includes(itemId) ?? false,
              onSelect: (): void => {
                selection.config.toggleSelectForRef.current([entity]);
              },
              rowIndex: index,
            },
            stickyLeftOffset: '0',
            stickyMinWidth: SELECTION_COLUMN_WIDTH,
            style: { maxWidth: SELECTION_COLUMN_WIDTH },
          },
        },
      ];
    },
    [selection, useHybridBody],
  );

  return { getLeadingCells, leadingColumns, useHybridBody };
};
