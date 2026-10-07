import { getDefaultNetworkLabel } from '@utils/mappings/constants';

export const getNetworkName = (networkPath: string | number): string => {
  if (!networkPath || typeof networkPath !== 'string') {
    return getDefaultNetworkLabel();
  }

  const parts = networkPath.split('/');

  return parts[parts.length - 1];
};
