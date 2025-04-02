import type { VmData } from '../../details/tabs/VirtualMachines/components/VMCellProps';

export const getNamespacesUsedBySelectedVms = (selectedVMs: VmData[]) =>
  Array.from(
    new Set(
      selectedVMs
        .map((data) => (data?.vm?.providerType === 'openshift' ? data.vm.namespace : undefined))
        .filter(Boolean),
    ),
  );
