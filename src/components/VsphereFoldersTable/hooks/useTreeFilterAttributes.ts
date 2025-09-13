import { useMemo } from 'react';

import {
  type AttributeConfig,
  AttributeKind,
} from '@components/VsphereFoldersTable/components/AttributeFilter/utils/types';
import {
  COLUMN_IDS,
  folderFilterId,
  type RowNode,
  type VmRow,
} from '@components/VsphereFoldersTable/utils/types';
import { useForkliftTranslation } from '@utils/i18n';

import { orderedConcernCategoriesFilterOptions, powerFilterOptions } from './utils/constants';
import {
  getConcernLabelFilterOptions,
  getHostnameFilterOptions,
  getVmConcernCategories,
  getVmConcernLabels,
  getVmHost,
  getVmName,
  getVmPath,
  getVmPower,
} from './utils/treeUtils';

export const useTreeFilterAttributes = (rows: RowNode[]) => {
  const { t } = useForkliftTranslation();

  const attributes: AttributeConfig<VmRow>[] = useMemo(
    () => [
      { getValue: getVmName, id: COLUMN_IDS.Name, kind: AttributeKind.Text, label: t('VM name') },
      {
        getValue: (row) => row.vmData.folderName ?? '',
        id: folderFilterId,
        kind: AttributeKind.Text,
        label: t('Folder name'),
      },
      {
        getValues: (row) => getVmConcernCategories(row),
        id: `${COLUMN_IDS.Concerns}-type`,
        kind: AttributeKind.Checkbox,
        label: t('Concern type'),
        options: orderedConcernCategoriesFilterOptions,
      },
      {
        getValues: (row) => getVmConcernLabels(row).labels,
        id: `${COLUMN_IDS.Concerns}-label`,
        kind: AttributeKind.Checkbox,
        label: t('Concern label'),
        options: getConcernLabelFilterOptions(rows),
      },
      {
        getValues: getVmHost,
        id: COLUMN_IDS.Host,
        kind: AttributeKind.Checkbox,
        label: t('Host'),
        options: getHostnameFilterOptions(rows),
      },
      {
        getValues: getVmPower,
        id: COLUMN_IDS.Power,
        kind: AttributeKind.Checkbox,
        label: t('Power'),
        options: powerFilterOptions,
      },
      {
        getValue: getVmPath,
        id: COLUMN_IDS.Path,
        kind: AttributeKind.Text,
        label: t('Path'),
      },
    ],
    [rows, t],
  );
  return attributes;
};
