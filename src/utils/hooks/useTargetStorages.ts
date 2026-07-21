import { useMemo } from 'react';
import { useOpenShiftStorages } from 'src/utils/hooks/useStorages';

import type { V1beta1Provider } from '@forklift-ui/types';
import { mapTargetStorages } from '@utils/storage/mapTargetStorages';
import type { TargetStorage } from '@utils/storage/types';

const useTargetStorages = (
  targetProvider: V1beta1Provider | undefined,
  targetProject: string | undefined,
): [TargetStorage[], boolean, Error | null] => {
  const [availableTargetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);

  const targetStorages = useMemo(
    () => mapTargetStorages(availableTargetStorages, targetProject),
    [availableTargetStorages, targetProject],
  );

  return [targetStorages, targetStoragesLoading, targetStoragesError];
};

export default useTargetStorages;
