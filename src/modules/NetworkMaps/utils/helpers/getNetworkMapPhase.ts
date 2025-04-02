import type { NetworkMapData } from '../types/NetworkMapData';

export const getNetworkMapPhase = (data: NetworkMapData) => {
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
