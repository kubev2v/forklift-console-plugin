import { DEFAULT_NETWORK } from '@utils/constants';

export const getNetworkName = (value: string | undefined): string => value ?? DEFAULT_NETWORK;
