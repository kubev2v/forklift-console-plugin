import {
  ConcernCategory,
  CustomFilterType,
} from 'src/modules/Providers/views/details/tabs/VirtualMachines/constants';

import type { Concern, ProviderVirtualMachine as KubeProviderVirtualMachine } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { ProviderType, type ProviderVirtualMachine } from '../../types';

export const hasCriticalConcern = (vm: ProviderVirtualMachine | KubeProviderVirtualMachine) =>
  vm.providerType !== ProviderType.Openshift &&
  vm.concerns?.some((concern) => concern.category === ConcernCategory.Critical);

export const criticalConcernFilter = () => ({
  dynamicFilter: (items: { vm: { concerns: Concern[] } }[]) => {
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
