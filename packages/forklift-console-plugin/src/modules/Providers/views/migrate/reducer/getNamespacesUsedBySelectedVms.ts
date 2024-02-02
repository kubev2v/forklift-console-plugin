import { VmData } from '../../details';

export const getNamespacesUsedBySelectedVms = (selectedVMs: VmData[]) =>
  Array.from(
    new Set(
      selectedVMs
        .map((d) => (d?.vm?.providerType === 'openshift' ? d.vm.namespace : undefined))
        .filter(Boolean),
    ),
  );
