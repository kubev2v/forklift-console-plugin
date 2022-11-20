import { K8sConditionStatus } from '_/components/types';

import { ProviderType } from '@app/common/constants';

export const PROVIDERS: Record<ProviderType, (t: (k: string) => string) => string> = {
  vsphere: (t) => t('VMware'),
  ovirt: (t) => t('oVirt'),
  openshift: (t) => t('KubeVirt'),
};

export const CONDITIONS: Record<K8sConditionStatus, (t: (k: string) => string) => string> = {
  True: (t) => t('True'),
  False: (t) => t('False'),
  Unknown: (t) => t('Unknown'),
};
