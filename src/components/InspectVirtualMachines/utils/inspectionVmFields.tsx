import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import {
  INSPECTION_STATUS_FILTER_VALUES,
  INSPECTION_STATUS_NOT_INSPECTED,
} from '@utils/crds/conversion/constants';
import { t } from '@utils/i18n';

import type { InspectionVmRowData } from './normalizeVmsForInspection';

export enum InspectionVmFieldId {
  DiskEncryption = 'diskEncryption',
  InspectionStatus = 'inspectionStatus',
  Name = 'name',
  VmId = 'vmId',
}

export const inspectionVmFields: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.name',
    label: t('VM Name'),
    resourceFieldId: InspectionVmFieldId.Name,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: '$.id',
    label: t('VM ID'),
    resourceFieldId: InspectionVmFieldId.VmId,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by inspection status'),
      type: FilterDefType.Enum,
      values: INSPECTION_STATUS_FILTER_VALUES.map((value) => ({
        id: value,
        label: t(value),
      })),
    },
    isVisible: true,
    jsonPath: (item: unknown) =>
      (item as InspectionVmRowData).inspectionStatus ?? INSPECTION_STATUS_NOT_INSPECTED,
    label: t('Inspection status'),
    resourceFieldId: InspectionVmFieldId.InspectionStatus,
    sortable: false,
  },
  {
    isVisible: false,
    jsonPath: '$.diskEncryptionLabel',
    label: t('Disk encryption'),
    resourceFieldId: InspectionVmFieldId.DiskEncryption,
    sortable: false,
  },
];
