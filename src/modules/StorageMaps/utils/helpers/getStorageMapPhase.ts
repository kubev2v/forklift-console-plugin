import type { StorageMapData } from '../types/StorageMapData';

export const getStorageMapPhase = (data: StorageMapData) => {
  const conditions = data?.obj?.status?.conditions;

  const isCritical = conditions?.find(
    (condition) => condition.category === 'Critical' && condition.status === 'True',
  );
  const isReady = conditions?.find(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  );

  if (isCritical) {
    return 'Critical';
  }

  if (isReady) {
    return 'Ready';
  }

  return 'Not Ready';
};
