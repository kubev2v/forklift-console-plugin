import { useCallback, useEffect, useMemo, useState } from 'react';
import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import { onDiskDecryptionConfirm } from '../utils/utils';

import type { EditLUKSState } from './types';

const DECRYPTION_MODE_EXISTING = 'existing';
const DECRYPTION_MODE_PASSPHRASES = 'passphrases';

export type DecryptionMode = typeof DECRYPTION_MODE_EXISTING | typeof DECRYPTION_MODE_PASSPHRASES;

export { DECRYPTION_MODE_EXISTING, DECRYPTION_MODE_PASSPHRASES };

export const useEditLUKSState = (resource: EditLUKSState['resource']): EditLUKSState => {
  const secretName = getLUKSSecretName(resource);
  const secretNamespace = getNamespace(resource);
  const allVMsHasMatchingLuks = getPlanVirtualMachines(resource).every(
    (vm) => vm.luks?.name === secretName,
  );

  const watchResource: WatchK8sResource | null = useMemo(
    () =>
      secretName
        ? {
            groupVersionKind: getGroupVersionKindForModel(SecretModel),
            name: secretName,
            namespace: secretNamespace,
          }
        : null,
    [secretName, secretNamespace],
  );

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>(watchResource);

  const [value, setValue] = useState<string[]>([]);
  const [nbdeClevis, setNbdeClevis] = useState<boolean>(false);
  const [decryptionMode, setDecryptionMode] = useState<DecryptionMode>(DECRYPTION_MODE_PASSPHRASES);
  const [selectedSecret, setSelectedSecret] = useState<IoK8sApiCoreV1Secret | undefined>();
  const [modeInitialized, setModeInitialized] = useState(false);

  useEffect(() => {
    const vms = getPlanVirtualMachines(resource) as EnhancedPlanSpecVms[];
    if (!isEmpty(vms)) {
      setNbdeClevis(vms[0]?.nbdeClevis ?? false);
    }
  }, [resource]);

  useEffect(() => {
    if (modeInitialized || !secret?.metadata) return;

    const isFromExisting = Boolean(secret.metadata.labels?.[SOURCE_SECRET_LABEL]);
    if (isFromExisting) {
      setDecryptionMode(DECRYPTION_MODE_EXISTING);
    }
    setModeInitialized(true);
  }, [modeInitialized, secret?.metadata]);

  useEffect(() => {
    if (secretName && secret?.data && !nbdeClevis) {
      const decoded = Object.values(secret.data)
        .map((secretData) => {
          try {
            return atob(secretData);
          } catch {
            return '';
          }
        })
        .filter(Boolean);

      setValue(decoded);
    }
  }, [secretName, secret?.data, nbdeClevis]);

  useEffect(() => {
    if (nbdeClevis) {
      setValue([]);
    }
  }, [nbdeClevis]);

  const handleConfirm = useCallback(async (): Promise<unknown> => {
    if (decryptionMode === DECRYPTION_MODE_EXISTING && selectedSecret) {
      return onDiskDecryptionConfirm({
        existingSecret: selectedSecret,
        nbdeClevis: false,
        newValue: JSON.stringify([]),
        resource,
      });
    }

    return onDiskDecryptionConfirm({
      nbdeClevis,
      newValue: JSON.stringify(value),
      resource,
    });
  }, [decryptionMode, nbdeClevis, resource, selectedSecret, value]);

  return {
    allVMsHasMatchingLuks,
    decryptionMode,
    handleConfirm,
    isDisabled: decryptionMode === DECRYPTION_MODE_EXISTING && !selectedSecret,
    nbdeClevis,
    resource,
    secretNamespace,
    selectedSecret,
    setDecryptionMode,
    setNbdeClevis,
    setSelectedSecret,
    setValue,
    value,
  };
};
