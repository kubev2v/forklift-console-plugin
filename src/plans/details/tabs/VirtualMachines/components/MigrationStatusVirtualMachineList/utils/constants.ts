import { createElement } from 'react';
import DatesComparedHelperText from 'src/plans/details/components/DatesComparedHelperText';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

import { MigrationStatusVirtualMachinesTableResourceId } from './types';
import { getVMDiskProgress, getVMMigrationStatus } from './utils';

const vmStatuses = [
  { id: 'Failed', label: 'Failed' },
  { id: 'Running', label: 'Running' },
  { id: 'Succeeded', label: 'Succeeded' },
  { id: 'Unknown', label: 'Unknown' },
  { id: 'Waiting', label: 'Waiting for cutover' },
  { id: 'NotStarted', label: 'Not started' },
];
export const planMigrationVirtualMachinesFields: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.specVM.name',
    label: t('Name'),
    resourceFieldId: MigrationStatusVirtualMachinesTableResourceId.Name,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Pipeline status'),
      primary: true,
      type: FilterDefType.Enum,
      values: vmStatuses,
    },
    isVisible: true,
    jsonPath: getVMMigrationStatus,
    label: t('Pipeline status'),
    resourceFieldId: MigrationStatusVirtualMachinesTableResourceId.Status,
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: getVMDiskProgress,
    label: t('Disk transfer'),
    resourceFieldId: MigrationStatusVirtualMachinesTableResourceId.Transfer,
  },
  {
    isVisible: true,
    jsonPath: getVMDiskProgress,
    label: t('Disk counter'),
    resourceFieldId: MigrationStatusVirtualMachinesTableResourceId.DiskCounter,
  },
  {
    filter: {
      helperText: createElement(DatesComparedHelperText),
      placeholderLabel: 'YYYY-MM-DD',
      type: FilterDefType.DateRange,
    },
    isVisible: true,
    jsonPath: '$.statusVM.started',
    label: t('Started at'),
    resourceFieldId: MigrationStatusVirtualMachinesTableResourceId.MigrationStarted,
    sortable: true,
  },
  {
    filter: {
      helperText: createElement(DatesComparedHelperText),
      placeholderLabel: 'YYYY-MM-DD',
      type: FilterDefType.DateRange,
    },
    isVisible: true,
    jsonPath: '$.statusVM.completed',
    label: t('Completed at'),
    resourceFieldId: MigrationStatusVirtualMachinesTableResourceId.MigrationCompleted,
    sortable: true,
  },
];
