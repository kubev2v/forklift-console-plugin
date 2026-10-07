import { getDefaultNetworkLabel } from '@utils/mappings/constants';

export const getNetworkName = (value: string | undefined): string =>
  value ?? getDefaultNetworkLabel();
