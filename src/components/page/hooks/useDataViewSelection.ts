import { useMemo } from 'react';

import {
  getExpandHeaderProps,
  getSelectionHeaderProps,
} from '@components/common/DataViewTable/dataViewControlColumnUtils';
import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useOptionalPageSelection } from '../context/useOptionalPageSelection';

type UseDataViewSelectionResult = {
  leadingColumns: DataViewTh[];
};

export const useDataViewSelection = (): UseDataViewSelectionResult => {
  const { t } = useForkliftTranslation();
  const selection = useOptionalPageSelection<unknown>();

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
        props: getSelectionHeaderProps(t('Row select'), selection.config.hasExpansion),
      });
    }
    return columns;
  }, [selection, t]);

  return { leadingColumns };
};
