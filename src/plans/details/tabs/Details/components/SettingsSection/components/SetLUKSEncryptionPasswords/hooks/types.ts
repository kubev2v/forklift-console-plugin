import type { Dispatch, SetStateAction } from 'react';

import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';

import type { DecryptionMode } from './useEditLUKSState';

export type EditLUKSState = {
  allVMsHasMatchingLuks: boolean;
  decryptionMode: DecryptionMode;
  handleConfirm: () => Promise<unknown>;
  isDisabled: boolean;
  nbdeClevis: boolean;
  resource: V1beta1Plan;
  secretNamespace: string | undefined;
  selectedSecret: IoK8sApiCoreV1Secret | undefined;
  setDecryptionMode: Dispatch<SetStateAction<DecryptionMode>>;
  setNbdeClevis: Dispatch<SetStateAction<boolean>>;
  setSelectedSecret: Dispatch<SetStateAction<IoK8sApiCoreV1Secret | undefined>>;
  setValue: Dispatch<SetStateAction<string[]>>;
  value: string[];
};
