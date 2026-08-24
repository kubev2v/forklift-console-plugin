import type { V1beta1Plan, V1beta1PlanStatusConditions } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import type { SpecVirtualMachinePageData } from '@utils/types/specVirtualMachinePageData';

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

export const getPlanConditionsDict = (
  plan: V1beta1Plan,
): Record<string, V1beta1PlanStatusConditions[]> => {
  const conditions = plan?.status?.conditions?.filter((condition) => !isEmpty(condition?.items));
  const conditionsDict = conditions?.reduce<Record<string, V1beta1PlanStatusConditions[]>>(
    (dict, condition) => {
      const items = condition?.items;
      if (items) {
        for (const item of items) {
          const { id: vmID } = extractIdAndNameFromConditionItem(item);
          if (vmID) {
            if (!dict[vmID]) {
              dict[vmID] = [];
            }

            dict[vmID].push(condition);
          }
        }
      }
      return dict;
    },
    {},
  );
  return conditionsDict ?? {};
};

export const vmDataToId = (item: SpecVirtualMachinePageData): string => item?.specVM?.id ?? '';

export const canSelect = (item: SpecVirtualMachinePageData): boolean =>
  item?.statusVM?.started === undefined || item?.statusVM?.error !== undefined;
