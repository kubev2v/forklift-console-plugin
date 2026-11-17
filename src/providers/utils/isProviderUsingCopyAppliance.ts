import type { V1beta1Provider } from '@forklift-ui/types';
import { getType } from '@utils/crds/common/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { VddkSetupMode } from './constants';
import { getDiskTransferMethod } from './getDiskTransferMethod';

export const isProviderUsingCopyAppliance = (
  provider: V1beta1Provider | undefined,
  templateExists = false,
): boolean =>
  Boolean(provider) &&
  getType(provider) === PROVIDER_TYPES.vsphere &&
  getDiskTransferMethod(provider as V1beta1Provider, templateExists) ===
    VddkSetupMode.CopyAppliance;
