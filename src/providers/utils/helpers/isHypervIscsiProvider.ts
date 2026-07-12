import { HypervTransferMethod } from 'src/providers/create/fields/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';

export const isHypervIscsiProvider = (provider: V1beta1Provider | undefined): boolean =>
  provider?.spec?.type === PROVIDER_TYPES.hyperv &&
  provider?.spec?.settings?.hyperVTransferMethod === HypervTransferMethod.ISCSI;
