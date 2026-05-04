import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

export enum InspectionVmFieldId {
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
    isVisible: true,
    jsonPath: '$.phase',
    label: t('Inspection status'),
    resourceFieldId: InspectionVmFieldId.InspectionStatus,
    sortable: false,
  },
];
