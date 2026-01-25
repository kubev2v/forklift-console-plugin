import { useMemo } from 'react';
import { StorageClassAnnotation, type TargetStorage } from 'src/storageMaps/utils/types';
import { useOpenShiftStorages } from 'src/utils/hooks/useStorages';

import type { V1beta1Provider } from '@kubev2v/types';

const useTargetStorages = (
  targetProvider: V1beta1Provider | undefined,
  targetProject: string | undefined,
): [TargetStorage[], boolean, Error | null] => {
  const [availableTargetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);

  const targetStorages = useMemo(
    () =>
      availableTargetStorages?.reduce((acc: TargetStorage[], storage) => {
        if (storage.namespace === targetProject || !storage.namespace) {
          const isDefault =
            storage?.object?.metadata?.annotations?.[StorageClassAnnotation.IsDefault] === 'true';
          const targetStorage: TargetStorage = {
            id: storage.uid,
            isDefault,
            name: storage.name,
          };

          if (isDefault) {
            return [targetStorage, ...acc];
          }
          return [...acc, targetStorage];
        }

        return acc;
      }, []),
    [availableTargetStorages, targetProject],
  );

  return [targetStorages, targetStoragesLoading, targetStoragesError];
};

export default useTargetStorages;
