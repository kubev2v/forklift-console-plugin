import type { Concern, ProviderVirtualMachine as KubeProviderVirtualMachine } from '@kubev2v/types';
import { t } from '@utils/i18n';

import { ProviderType, type ProviderVirtualMachine } from '../../types';

export const hasCriticalConcern = (vm: ProviderVirtualMachine | KubeProviderVirtualMachine) =>
  vm.providerType !== ProviderType.Openshift &&
  vm.concerns?.some((concern) => concern.category === 'Critical');

export const criticalConcernFilter = () => ({
  dynamicFilter: (items: { vm: { concerns: Concern[] } }[]) => {
    const uniqueLabels = new Set<string>();

    for (const item of items) {
      if (item?.vm?.concerns?.length) {
        for (const concern of item.vm.concerns.filter(({ category }) => category === 'Critical')) {
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
  type: 'criticalConcerns',
});
