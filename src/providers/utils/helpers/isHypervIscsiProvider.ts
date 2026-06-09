import { HypervTransferMethod } from 'src/providers/create/fields/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

export const isHypervIscsiProvider = (provider: V1beta1Provider | undefined): boolean =>
  provider?.spec?.type === PROVIDER_TYPES.hyperv &&
  provider?.spec?.settings?.hyperVTransferMethod === HypervTransferMethod.ISCSI;
