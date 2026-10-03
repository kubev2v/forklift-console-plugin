import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

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
      popover: (
        <HelpIconPopover header={t('Bus address')}>
          {t('vSphere disk bus address stored in the plan as excludeDisks (for example, scsi0:1).')}
        </HelpIconPopover>
      ),
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
      popover: (
        <HelpIconPopover header={t('Shared with other VMs')}>
          {t(
            'Yes if the same disk file is used by multiple VMs on the source provider (vSphere inventory). Unrelated to the plan Migrate shared disks setting.',
          )}
        </HelpIconPopover>
      ),
    },
    isVisible: true,
    jsonPath: (item: unknown): string => (item as ExcludeDiskRowData).sharedFilterValue,
    label: t('Shared with other VMs'),
    resourceFieldId: ExcludeDiskFieldId.Shared,
    sortable: true,
  },
];
