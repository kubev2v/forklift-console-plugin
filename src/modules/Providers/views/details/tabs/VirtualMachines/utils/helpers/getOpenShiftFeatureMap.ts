import type { VmFeatures } from 'src/utils/types';

import type { ProviderVirtualMachine } from '@kubev2v/types';

export const getOpenShiftFeatureMap = (vm: ProviderVirtualMachine): VmFeatures => {
  if (vm.providerType !== 'openshift') {
    return {};
  }
  const domain = vm.object?.spec?.template?.spec?.domain;
  if (!domain) {
    return {};
  }

  return {
    dedicatedCpu: Boolean(domain?.cpu?.dedicatedCpuPlacement),
    gpusHostDevices:
      Boolean(domain.devices?.gpus?.length) || Boolean(domain?.devices?.hostDevices?.length),
    numa: Boolean(domain.cpu?.numa),
    persistentTpmEfi:
      Boolean(domain?.devices?.tpm?.persistent) || domain?.firmware?.bootloader?.efi?.persistent,
  };
};
