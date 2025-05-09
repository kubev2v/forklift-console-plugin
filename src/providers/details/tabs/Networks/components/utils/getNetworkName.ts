export const getNetworkName = (networkPath: string | number): string => {
  if (!networkPath || typeof networkPath !== 'string') {
    return 'Pod network';
  }

  const parts = networkPath.split('/');

  return parts[parts.length - 1];
};
