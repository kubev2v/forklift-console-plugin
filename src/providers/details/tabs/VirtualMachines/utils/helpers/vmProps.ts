import type { ProviderVirtualMachine } from '@forklift-ui/types';

import type { VmData } from '../../components/VMCellProps';

export const getVmTemplate = (vm: ProviderVirtualMachine): string | undefined =>
  vm?.providerType === 'openshift'
    ? vm.object?.metadata?.labels?.['vm.kubevirt.io/template']
    : undefined;

export const getVmId = (vmData: VmData): string => vmData?.vm?.id ?? '';
