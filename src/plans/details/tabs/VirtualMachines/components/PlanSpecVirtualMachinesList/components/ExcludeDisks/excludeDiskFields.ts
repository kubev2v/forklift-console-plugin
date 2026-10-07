import { createElement } from 'react';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

import ExcludeDiskBusAddressHelpPopover from './ExcludeDiskBusAddressHelpPopover';
import ExcludeDiskSharedWithOtherVmsHelpPopover from './ExcludeDiskSharedWithOtherVmsHelpPopover';
import type { ExcludeDiskRowData } from './types';

export enum ExcludeDiskFieldId {
  BusAddress = 'busAddress',
  FileName = 'fileName',
  Shared = 'sharedWithOtherVms',
  Size = 'size',
}

const SHARED_FILTER_VALUES = [
  { id: 'no', label: t('No') },
  { id: 'unknown', label: t('Unknown') },
  { id: 'yes', label: t('Yes') },
];

export const excludeDiskFields: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by bus address'),
      type: FilterDefType.FreeText,
    },
    info: {
      ariaLabel: t('More information on bus address'),
      popover: createElement(ExcludeDiskBusAddressHelpPopover),
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.busAddress',
    label: t('Bus address'),
    resourceFieldId: ExcludeDiskFieldId.BusAddress,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by file name'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: '$.fileName',
    label: t('File name'),
    resourceFieldId: ExcludeDiskFieldId.FileName,
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: '$.sizeBytes',
    label: t('Size'),
    resourceFieldId: ExcludeDiskFieldId.Size,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by shared with other VMs'),
      type: FilterDefType.Enum,
      values: SHARED_FILTER_VALUES,
    },
    info: {
      ariaLabel: t('More information on shared with other VMs'),
      popover: createElement(ExcludeDiskSharedWithOtherVmsHelpPopover),
    },
    isVisible: true,
    jsonPath: (item: unknown): string => (item as ExcludeDiskRowData).sharedFilterValue,
    label: t('Shared with other VMs'),
    resourceFieldId: ExcludeDiskFieldId.Shared,
    sortable: true,
  },
];
