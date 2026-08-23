import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import { onDiskDecryptionConfirm } from '../utils/utils';

import { DECRYPTION_MODE_EXISTING, type DecryptionMode } from './editLuksHelpers';
import type { EditLUKSState } from './types';

type ConfirmLuksDecryptionParams = {
  decryptionMode: DecryptionMode;
  nbdeClevis: boolean;
  resource: EditLUKSState['resource'];
  secret?: IoK8sApiCoreV1Secret;
  selectedSecret?: IoK8sApiCoreV1Secret;
  selectedSecretWasAutoSeeded: boolean;
  sourceSecretName?: string;
  value: string[];
};

export const confirmLuksDecryption = async ({
  decryptionMode,
  nbdeClevis,
  resource,
  secret,
  selectedSecret,
  selectedSecretWasAutoSeeded,
  sourceSecretName,
  value,
}: ConfirmLuksDecryptionParams): Promise<unknown> => {
  if (decryptionMode === DECRYPTION_MODE_EXISTING && selectedSecret) {
    return onDiskDecryptionConfirm({
      existingSecret: selectedSecret,
      labeledSourceSecretName: selectedSecretWasAutoSeeded ? sourceSecretName : undefined,
      nbdeClevis: false,
      newValue: JSON.stringify([]),
      resource,
    });
  }

  return onDiskDecryptionConfirm({
    currentSecret: secret,
    nbdeClevis,
    newValue: JSON.stringify(value),
    resource,
  });
};
