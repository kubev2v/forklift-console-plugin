import { useCallback, useMemo, useRef, useState } from 'react';
import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import { onDiskDecryptionConfirm } from '../utils/utils';

import type { EditLUKSState } from './types';

const DECRYPTION_MODE_EXISTING = 'existing';
const DECRYPTION_MODE_PASSPHRASES = 'passphrases';

export type DecryptionMode = typeof DECRYPTION_MODE_EXISTING | typeof DECRYPTION_MODE_PASSPHRASES;

export { DECRYPTION_MODE_EXISTING, DECRYPTION_MODE_PASSPHRASES };

const getNbdeClevisFromResource = (resource: EditLUKSState['resource']): boolean => {
  const vms = getPlanVirtualMachines(resource) as EnhancedPlanSpecVms[];
  if (isEmpty(vms)) {
    return false;
  }
  return vms[0]?.nbdeClevis ?? false;
};

const decodeSecretPassphrases = (secretData: Record<string, string> | undefined): string[] => {
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

  const sourceSecretName = secret?.metadata?.labels?.[SOURCE_SECRET_LABEL];
  const sourceWatchResource: WatchK8sResource | null = useMemo(
    () =>
      sourceSecretName && secretNamespace
        ? {
            groupVersionKind: getGroupVersionKindForModel(SecretModel),
            name: sourceSecretName,
            namespace: secretNamespace,
          }
        : null,
    [sourceSecretName, secretNamespace],
  );

  const [sourceSecret] = useK8sWatchResource<IoK8sApiCoreV1Secret>(sourceWatchResource);

  const derivedNbdeClevis = getNbdeClevisFromResource(resource);
  const [value, setValue] = useState<string[]>([]);
  const [nbdeClevis, setNbdeClevis] = useState<boolean>(derivedNbdeClevis);
  const [decryptionMode, setDecryptionMode] = useState<DecryptionMode>(DECRYPTION_MODE_PASSPHRASES);
  const [selectedSecret, setSelectedSecret] = useState<IoK8sApiCoreV1Secret | undefined>();
  const [prevResource, setPrevResource] = useState(resource);
  const [prevSecretDataKey, setPrevSecretDataKey] = useState<string | undefined>();
  const modeInitializedRef = useRef(false);
  const selectedSecretInitializedRef = useRef(false);

  if (resource !== prevResource) {
    setPrevResource(resource);
    setNbdeClevis(getNbdeClevisFromResource(resource));
  }

  if (nbdeClevis && !isEmpty(value)) {
    setValue([]);
  }

  if (!modeInitializedRef.current && secret?.metadata) {
    modeInitializedRef.current = true;
    if (secret.metadata.labels?.[SOURCE_SECRET_LABEL]) {
      setDecryptionMode(DECRYPTION_MODE_EXISTING);
    }
  }

  if (!selectedSecretInitializedRef.current && sourceSecret?.metadata?.name) {
    selectedSecretInitializedRef.current = true;
    setSelectedSecret(sourceSecret);
  }

  const secretDataKey = secretName && secret?.data ? JSON.stringify(secret.data) : undefined;
  if (secretDataKey !== prevSecretDataKey) {
    setPrevSecretDataKey(secretDataKey);
    if (secretName && secret?.data && !nbdeClevis) {
      setValue(decodeSecretPassphrases(secret.data));
    }
  }

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
