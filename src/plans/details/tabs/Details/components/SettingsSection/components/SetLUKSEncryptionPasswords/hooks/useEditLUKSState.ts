import { type Dispatch, type SetStateAction, useCallback, useMemo, useRef, useState } from 'react';

import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { confirmLuksDecryption } from './confirmLuksDecryption';
import {
  allVMsHaveMatchingLuks,
  decodeSecretPassphrases,
  DECRYPTION_MODE_EXISTING,
  DECRYPTION_MODE_PASSPHRASES,
  type DecryptionMode,
  getNbdeClevisFromResource,
  getSecretDataKey,
  getSourceSecretName,
  isNotFoundWatchError,
  isSecretNamed,
} from './editLuksHelpers';
import type { EditLUKSState } from './types';

export { DECRYPTION_MODE_EXISTING, DECRYPTION_MODE_PASSPHRASES };
export type { DecryptionMode };

export const useEditLUKSState = (resource: EditLUKSState['resource']): EditLUKSState => {
  const secretName = getLUKSSecretName(resource);
  const secretNamespace = getNamespace(resource);
  const allVMsHasMatchingLuks = allVMsHaveMatchingLuks(resource);

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

  const [secret, secretLoaded, secretLoadError] =
    useK8sWatchResource<IoK8sApiCoreV1Secret>(watchResource);

  const sourceSecretName = getSourceSecretName(secret);
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

  const [sourceSecret, sourceSecretLoaded, sourceSecretLoadError] =
    useK8sWatchResource<IoK8sApiCoreV1Secret>(sourceWatchResource);

  const derivedNbdeClevis = getNbdeClevisFromResource(resource);
  const [value, setValue] = useState<string[]>([]);
  const [nbdeClevis, setNbdeClevis] = useState<boolean>(derivedNbdeClevis);
  const [decryptionMode, setDecryptionMode] = useState<DecryptionMode>(DECRYPTION_MODE_PASSPHRASES);
  const [selectedSecret, setSelectedSecret] = useState<IoK8sApiCoreV1Secret | undefined>();
  const [isSourceSecretUnavailable, setIsSourceSecretUnavailable] = useState(false);
  const [prevResource, setPrevResource] = useState(resource);
  const [prevSecretDataKey, setPrevSecretDataKey] = useState<string | undefined>();
  const modeInitializedRef = useRef(false);
  const selectedSecretInitializedRef = useRef(false);
  const selectedSecretWasAutoSeededRef = useRef(false);

  if (resource !== prevResource) {
    setPrevResource(resource);
    setNbdeClevis(getNbdeClevisFromResource(resource));
  }

  if (nbdeClevis && !isEmpty(value)) {
    setValue([]);
  }

  if (!modeInitializedRef.current && isSecretNamed(secret)) {
    modeInitializedRef.current = true;
    if (secret && getSourceSecretName(secret)) {
      setDecryptionMode(DECRYPTION_MODE_EXISTING);
    }
  }

  if (!selectedSecretInitializedRef.current && sourceSecretName) {
    if (isSecretNamed(sourceSecret)) {
      selectedSecretInitializedRef.current = true;
      if (!selectedSecret) {
        selectedSecretWasAutoSeededRef.current = true;
        setSelectedSecret(sourceSecret);
      }
    } else if (
      isNotFoundWatchError(sourceSecretLoadError) ||
      (sourceSecretLoaded && !sourceSecretLoadError)
    ) {
      selectedSecretInitializedRef.current = true;
      if (!selectedSecret) {
        setDecryptionMode(DECRYPTION_MODE_PASSPHRASES);
        setIsSourceSecretUnavailable(true);
      }
    }
  }

  const secretDataKey = getSecretDataKey(secretName, secret);
  if (secretDataKey !== prevSecretDataKey) {
    setPrevSecretDataKey(secretDataKey);
    if (secretName && secret?.data && !nbdeClevis) {
      setValue(decodeSecretPassphrases(secret.data));
    }
  }

  const handleSetSelectedSecret: Dispatch<SetStateAction<IoK8sApiCoreV1Secret | undefined>> =
    useCallback((next) => {
      selectedSecretWasAutoSeededRef.current = false;
      setSelectedSecret(next);
    }, []);

  const handleConfirm = useCallback(
    async (): Promise<unknown> =>
      confirmLuksDecryption({
        decryptionMode,
        nbdeClevis,
        resource,
        secret,
        selectedSecret,
        selectedSecretWasAutoSeeded: selectedSecretWasAutoSeededRef.current,
        sourceSecretName,
        value,
      }),
    [decryptionMode, nbdeClevis, resource, secret, selectedSecret, sourceSecretName, value],
  );

  return {
    allVMsHasMatchingLuks,
    decryptionMode,
    handleConfirm,
    isDisabled:
      (Boolean(secretName) && (!secretLoaded || Boolean(secretLoadError))) ||
      (decryptionMode === DECRYPTION_MODE_EXISTING && !selectedSecret),
    isSecretWatchPending: Boolean(secretName) && !secretLoaded && !secretLoadError,
    isSourceSecretUnavailable,
    nbdeClevis,
    resource,
    secretLoadError: secretName ? secretLoadError : null,
    secretNamespace,
    selectedSecret,
    setDecryptionMode,
    setNbdeClevis,
    setSelectedSecret: handleSetSelectedSecret,
    setValue,
    value,
  };
};
