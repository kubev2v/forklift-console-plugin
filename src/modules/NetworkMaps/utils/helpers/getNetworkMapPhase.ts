import type { NetworkMapData } from '../types';

export const getNetworkMapPhase = (data: NetworkMapData) => {
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
