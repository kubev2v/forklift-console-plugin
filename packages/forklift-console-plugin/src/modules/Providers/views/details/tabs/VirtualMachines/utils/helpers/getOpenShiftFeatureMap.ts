import { VmFeatures } from 'src/utils/types';

import { ProviderVirtualMachine, V1DomainSpec } from '@kubev2v/types';

export const getOpenShiftFeatureMap = (vm: ProviderVirtualMachine): VmFeatures => {
  if (vm.providerType !== 'openshift') {
    return {};
  }
  const domain: V1DomainSpec = vm.object?.spec?.template?.spec?.domain;
  if (!domain) {
    return {};
  }

  return {
    numa: !!domain.cpu?.numa,
    gpusHostDevices: !!domain.devices?.gpus?.length || !!domain?.devices?.hostDevices?.length,
    persistentTpmEfi:
      !!domain?.devices?.tpm?.persistent || domain?.firmware?.bootloader?.efi?.persistent,
    dedicatedCpu: !!domain?.cpu?.dedicatedCpuPlacement,
  };
};
