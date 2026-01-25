import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { CustomFilterType } from '@components/common/FilterGroup/constants';
import type { FilterDef } from '@components/common/utils/types';
import type {
  Concern,
  ProviderVirtualMachine as KubeProviderVirtualMachine,
} from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import type { ProviderVirtualMachine } from '../../types';

export const hasCriticalConcern = (vm: ProviderVirtualMachine | KubeProviderVirtualMachine) =>
  vm.providerType !== PROVIDER_TYPES.openshift &&
  vm.concerns?.some((concern) => concern.category === ConcernCategory.Critical);

type VmConcernsFilterItems = { vm: { concerns: Concern[] } };

export const criticalConcernFilter = (): FilterDef => ({
  dynamicFilter: (unknownItems: unknown[]) => {
    const items = unknownItems as VmConcernsFilterItems[];
    const uniqueLabels = new Set<string>();

    for (const item of items) {
      if (!isEmpty(item?.vm?.concerns)) {
        for (const concern of item.vm.concerns.filter(
          ({ category }) => category === ConcernCategory.Critical,
        )) {
          uniqueLabels.add(concern.label);
        }
      }
    }

    const values = Array.from(uniqueLabels).map((label) => ({
      id: label,
      label,
    }));

    return { values };
  },
  placeholderLabel: t('Filter by critical concerns'),
  type: CustomFilterType.CriticalConcerns,
});

export const getVmsWithCriticalConcerns = (vms: Record<string, ProviderVirtualMachine>) =>
  Object.fromEntries(Object.entries(vms ?? {}).filter(([_, vm]) => hasCriticalConcern(vm)));
