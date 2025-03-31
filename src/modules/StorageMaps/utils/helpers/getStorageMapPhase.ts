import type { StorageMapData } from '../types';

export const getStorageMapPhase = (data: StorageMapData) => {
  const conditions = data?.obj?.status?.conditions;

  const isCritical = conditions?.find((c) => c.category === 'Critical' && c.status === 'True');
  const isReady = conditions?.find((c) => c.type === 'Ready' && c.status === 'True');

  if (isCritical) {
    return 'Critical';
  }

  if (isReady) {
    return 'Ready';
  }

  return 'Not Ready';
};
