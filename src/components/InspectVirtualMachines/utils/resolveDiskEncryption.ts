import { DISK_ENCRYPTION_TYPE } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';

import { createInspectionSecret } from './createInspectionSecret';
import type { DiskEncryptionParam, VmOverrides } from './types';

export const resolveDiskEncryption = async (
  overrides: VmOverrides | undefined,
  vmName: string,
  namespace: string,
): Promise<DiskEncryptionParam | undefined> => {
  if (!overrides) return undefined;

  if (overrides.nbdeClevis) {
    return { type: DISK_ENCRYPTION_TYPE.CLEVIS };
  }

  const nonEmptyPhrases = (overrides.passphrases ?? []).filter((phrase) => !isEmpty(phrase));
  if (!isEmpty(nonEmptyPhrases)) {
    const secret = await createInspectionSecret(nonEmptyPhrases, vmName, namespace);
    return {
      secret: { name: secret.metadata?.name, namespace: secret.metadata?.namespace },
      type: DISK_ENCRYPTION_TYPE.LUKS,
    };
  }

  return undefined;
};
