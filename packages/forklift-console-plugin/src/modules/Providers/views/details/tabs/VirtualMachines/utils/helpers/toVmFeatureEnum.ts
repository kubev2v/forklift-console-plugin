import { VmFeatures } from 'src/utils/types';

export const toVmFeatureEnum = (t: (string) => string): { [k in keyof VmFeatures]: string } => ({
  numa: t('NUMA'),
  gpusHostDevices: t('GPUs/Host Devices'),
  persistentTpmEfi: t('Persistent TPM/EFI'),
  dedicatedCpu: t('Dedicated CPU'),
});
