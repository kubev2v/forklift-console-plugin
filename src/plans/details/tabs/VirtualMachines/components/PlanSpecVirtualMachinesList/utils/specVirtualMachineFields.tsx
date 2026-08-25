import { CustomFilterType } from 'src/components/common/FilterGroup/constants';
import ConcernsColumnPopover from 'src/components/Concerns/ConcernsColumnPopover';
import InspectionStatusColumnPopover from 'src/components/InspectVirtualMachines/InspectionStatusColumnPopover';

import { type EnumValue, FilterDefType, type ResourceField } from '@components/common/utils/types';
import { getCategoryIcon } from '@components/Concerns/utils/category';
import { orderedConcernCategories } from '@components/Concerns/utils/constants';
import {
  INSPECTION_STATUS_FILTER_VALUES,
  INSPECTION_STATUS_NOT_INSPECTED,
} from '@utils/crds/conversion/constants';
import { t } from '@utils/i18n';
import {
  PlanSpecVirtualMachinesTableResourceId,
  type SpecVirtualMachinePageData,
} from '@utils/types/specVirtualMachinePageData';
import { getVmGuestOS } from '@utils/vm/getVmGuestOS';

import { concernSeverityOrTypeFilter } from './concernSeverityOrTypeFilter';

export const specVirtualMachineFields: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.specVM.name',
    label: t('Name'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.Name,
    sortable: true,
  },
  {
    filter: concernSeverityOrTypeFilter(),
    isForFilterOnly: true,
    isVisible: true,
    jsonPath: '$',
    label: t('Concerns'),
    resourceFieldId: `${PlanSpecVirtualMachinesTableResourceId.Concerns}-type`,
    sortable: true,
  },
  {
    filter: {
      fieldLabel: t('Concerns (severity)'),
      placeholderLabel: t('Filter by concerns (severity)'),
      primary: false,
      type: CustomFilterType.ConcernsSeverityOrType,
      values: orderedConcernCategories.map((category): EnumValue => ({
        icon: getCategoryIcon(category),
        id: category,
        label: category,
      })),
    },
    info: {
      ariaLabel: 'More information on concerns',
      popover: <ConcernsColumnPopover />,
    },
    isVisible: true,
    jsonPath: '$',
    label: t('Concerns'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.Concerns,
    sortable: true,
    testId: 'concerns-column-header',
  },
  {
    filter: {
      placeholderLabel: t('Filter by guest OS'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: (item: unknown) =>
      getVmGuestOS((item as SpecVirtualMachinePageData).inventoryVmData?.vm),
    label: t('Guest OS'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.GuestOS,
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
    info: {
      ariaLabel: 'More information on inspection status',
      popover: <InspectionStatusColumnPopover />,
    },
    isVisible: true,
    jsonPath: (item: unknown): string => {
      const { inspectionStatus } = item as SpecVirtualMachinePageData;
      return inspectionStatus?.status ?? INSPECTION_STATUS_NOT_INSPECTED;
    },
    label: t('Inspection status'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.InspectionStatus,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: '$.specVM.instanceType',
    label: t('Instance type'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.InstanceType,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: '$.specVM.migrateSharedDisks',
    label: t('Shared disks'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.MigrateSharedDisks,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: '$.specVM.targetPowerState',
    label: t('Target power state'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.TargetPowerState,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: '$.specVM.targetName',
    label: t('Target name'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.VMTargetName,
    sortable: true,
  },
  {
    isAction: true,
    isVisible: true,
    label: '',
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.Actions,
    sortable: false,
  },
];
