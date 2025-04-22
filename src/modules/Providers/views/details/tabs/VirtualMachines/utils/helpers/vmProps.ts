import type { ProviderVirtualMachine } from '@kubev2v/types';

export const getVmTemplate = (vm: ProviderVirtualMachine): string | undefined =>
  vm?.providerType === 'openshift'
    ? vm.object?.metadata?.labels?.['vm.kubevirt.io/template']
    : undefined;
