import { POD_NETWORK } from '@utils/constants';

export const getNetworkName = (networkPath: string | number): string => {
  if (!networkPath || typeof networkPath !== 'string') {
    return POD_NETWORK;
  }

  const parts = networkPath.split('/');

  return parts[parts.length - 1];
};
