import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { StorageMapFieldId } from '@utils/storage/types';

/**
 * Re-runs the parent storageMap field-array validator when nested offload
 * values change. Controller deps cover user selects; this also covers setValue
 * paths (clear, plugin switch) which do not trigger deps.
 */
export const useRevalidateStorageMap = (
  offloadPlugin: string | undefined,
  storageSecret: string | undefined,
  storageProduct: string | undefined,
): void => {
  const { trigger } = useFormContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trigger(StorageMapFieldId.StorageMap).catch(() => undefined);
  }, [offloadPlugin, storageProduct, storageSecret, trigger]);
};
