import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { getLabels, getName } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import type { EditLUKSState } from './types';

export const DECRYPTION_MODE_EXISTING = 'existing';
export const DECRYPTION_MODE_PASSPHRASES = 'passphrases';

export type DecryptionMode = typeof DECRYPTION_MODE_EXISTING | typeof DECRYPTION_MODE_PASSPHRASES;

const HTTP_NOT_FOUND = 404;

type WatchError = Error & { code?: number; status?: number };

export const isNotFoundWatchError = (error: Error | null): boolean => {
  if (!error) {
    return false;
  }

  const watchError = error as WatchError;
  if (watchError.code === HTTP_NOT_FOUND || watchError.status === HTTP_NOT_FOUND) {
    return true;
  }

  const message = watchError.message ?? '';
  return message.includes('NotFound') || message.toLowerCase().includes('not found');
};

export const getNbdeClevisFromResource = (resource: EditLUKSState['resource']): boolean => {
  const vms = getPlanVirtualMachines(resource) as EnhancedPlanSpecVms[];
  if (isEmpty(vms)) {
    return false;
  }
  return vms[0]?.nbdeClevis ?? false;
};

export const decodeSecretPassphrases = (
  secretData: Record<string, string> | undefined,
): string[] => {
  if (!secretData) {
    return [];
  }

  return Object.values(secretData)
    .map((secretValue) => {
      try {
        return atob(secretValue);
      } catch {
        return '';
      }
    })
    .filter(Boolean);
};

export const getSourceSecretName = (secret?: IoK8sApiCoreV1Secret): string | undefined =>
  secret ? getLabels(secret)?.[SOURCE_SECRET_LABEL] : undefined;

export const allVMsHaveMatchingLuks = (resource: EditLUKSState['resource']): boolean => {
  const secretName = getLUKSSecretName(resource);
  return getPlanVirtualMachines(resource).every((vm) => vm.luks?.name === secretName);
};

export const getSecretDataKey = (
  secretName: string | undefined,
  secret?: IoK8sApiCoreV1Secret,
): string | undefined => (secretName && secret?.data ? JSON.stringify(secret.data) : undefined);

export const isSecretNamed = (secret?: IoK8sApiCoreV1Secret): boolean => Boolean(getName(secret));
