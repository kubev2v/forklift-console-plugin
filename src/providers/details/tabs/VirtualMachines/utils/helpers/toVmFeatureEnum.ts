import type { VmFeatures } from 'src/utils/types';

import { t } from '@utils/i18n';

export const toVmFeatureEnum = (): { [k in keyof VmFeatures]: string } => ({
  dedicatedCpu: t('Dedicated CPU'),
  gpusHostDevices: t('GPUs/Host Devices'),
  numa: t('NUMA'),
  persistentTpmEfi: t('Persistent TPM/EFI'),
});
