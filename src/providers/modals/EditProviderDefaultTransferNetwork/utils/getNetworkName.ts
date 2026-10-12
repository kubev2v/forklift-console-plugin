import { isEmpty } from '@utils/helpers';
import { getDefaultNetworkLabel } from '@utils/mappings/constants';

export const getNetworkName = (value: string | undefined): string =>
  isEmpty(value) ? getDefaultNetworkLabel() : (value ?? '');
