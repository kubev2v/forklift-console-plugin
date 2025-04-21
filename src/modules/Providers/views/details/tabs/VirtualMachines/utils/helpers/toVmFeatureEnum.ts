import type { TFunction } from 'react-i18next';
import type { VmFeatures } from 'src/utils/types';

export const toVmFeatureEnum = (t: TFunction): { [k in keyof VmFeatures]: string } => ({
  dedicatedCpu: t('Dedicated CPU'),
  gpusHostDevices: t('GPUs/Host Devices'),
  numa: t('NUMA'),
  persistentTpmEfi: t('Persistent TPM/EFI'),
});
