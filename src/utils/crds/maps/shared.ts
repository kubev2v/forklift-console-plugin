import type { NetworkMapData } from 'src/networkMaps/utils/types';
import type { StorageMapData } from 'src/storageMaps/utils/types';

import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

export const getMapPhase = (data: NetworkMapData | StorageMapData) => {
  const conditions = data?.obj?.status?.conditions;

  const isCritical = conditions?.find(
    (condition) =>
      condition.category === CATEGORY_TYPES.CRITICAL && condition.status === CONDITION_STATUS.TRUE,
  );
  const isReady = conditions?.find(
    (condition) =>
      condition.type === CATEGORY_TYPES.READY && condition.status === CONDITION_STATUS.TRUE,
  );

  if (isCritical) {
    return CATEGORY_TYPES.CRITICAL;
  }

  if (isReady) {
    return CATEGORY_TYPES.READY;
  }

  return CATEGORY_TYPES.NOT_READY;
};
