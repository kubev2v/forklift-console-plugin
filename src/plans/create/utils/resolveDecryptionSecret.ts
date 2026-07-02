import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { DiskDecryptionType } from '../steps/other-settings/constants';
import type { CreatePlanFormData } from '../types';

import { createDecryptionSecret } from './createDecryptionSecret';

type ResolveResult = {
  isExistingSecret: boolean;
  secret: IoK8sApiCoreV1Secret | undefined;
};

export const resolveDecryptionSecret = async ({
  diskDecryptionPassPhrases,
  diskDecryptionType,
  existingLUKSSecret,
  planName,
  planProject,
}: Pick<
  CreatePlanFormData,
  | 'diskDecryptionPassPhrases'
  | 'diskDecryptionType'
  | 'existingLUKSSecret'
  | 'planName'
  | 'planProject'
>): Promise<ResolveResult> => {
  if (diskDecryptionType === DiskDecryptionType.Existing) {
    return { isExistingSecret: true, secret: existingLUKSSecret };
  }

  if (
    isEmpty(diskDecryptionPassPhrases) ||
    diskDecryptionPassPhrases.every((dp) => dp.value === '')
  ) {
    return { isExistingSecret: false, secret: undefined };
  }

  const secret = await createDecryptionSecret(diskDecryptionPassPhrases, planName, planProject);

  return { isExistingSecret: false, secret };
};
