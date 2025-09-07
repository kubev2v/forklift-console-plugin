import ConcernsColumnPopover from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/ConcernsColumnPopover';
import { concernFilter } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/filters/concernFilter';

import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import type { V1beta1Plan, V1beta1PlanStatusConditions } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { PlanSpecVirtualMachinesTableResourceId, type SpecVirtualMachinePageData } from './types';

/**
 * Extracts the ID and name from a condition item string.
 *
 * This function parses a string containing condition item details and extracts the ID and name.
 * The string format expected is something like "id:<some_id> name:'<some_name>'".
 *
 * @param {string} input - The string containing the condition item details.
 * @returns {{ id: string; name: string }} An object containing the extracted ID and name.
 */
const extractIdAndNameFromConditionItem = (input: string): { id: string; name: string } => {
  const idMatch = /id:(?<id>[^ ]+)/u.exec(input);
  const nameMatch = /name:'(?<name>[^']+)'/u.exec(input);

  if (!idMatch || !nameMatch) {
    return { id: '', name: '' };
  }

  return {
    id: idMatch.groups?.id ?? '',
    name: nameMatch?.groups?.name ?? '',
  };
};

export const specVirtualMachineFields: ResourceField[] = [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.specVM.name',
    label: t('Name'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.Name,
    sortable: true,
  },
  {
    filter: concernFilter(),
    info: {
      ariaLabel: 'More information on concerns',
      popover: <ConcernsColumnPopover />,
    },
    isVisible: true,
    jsonPath: '$.inventoryVmData.vm.concerns',
    label: t('Concerns'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.Concerns,
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
    isVisible: false,
    jsonPath: '$.specVM.targetPowerState',
    label: t('Target power state'),
    resourceFieldId: PlanSpecVirtualMachinesTableResourceId.TargetPowerState,
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

export const getPlanConditionsDict = (
  plan: V1beta1Plan,
): Record<string, V1beta1PlanStatusConditions[]> => {
  const conditions = plan?.status?.conditions?.filter((condition) => !isEmpty(condition?.items));
  const conditionsDict = conditions?.reduce<Record<string, V1beta1PlanStatusConditions[]>>(
    (dict, condition) => {
      condition.items?.forEach((item) => {
        const { id: vmID } = extractIdAndNameFromConditionItem(item);
        if (vmID) {
          if (!dict[vmID]) dict[vmID] = [];

          dict[vmID].push(condition);
        }
      });
      return dict;
    },
    {},
  );
  return conditionsDict ?? {};
};

export const vmDataToId = (item: SpecVirtualMachinePageData) => item?.specVM?.id ?? '';

export const canSelect = (item: SpecVirtualMachinePageData) =>
  item?.statusVM?.started === undefined || item?.statusVM?.error !== undefined;
