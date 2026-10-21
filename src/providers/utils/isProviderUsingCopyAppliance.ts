import type { V1beta1Provider } from '@forklift-ui/types';
import { getAnnotations, getType } from '@utils/crds/common/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from './constants';

export const isProviderUsingCopyAppliance = (provider: V1beta1Provider | undefined): boolean =>
  getType(provider) === PROVIDER_TYPES.vsphere &&
  getAnnotations(provider)?.[DISK_TRANSFER_METHOD_ANNOTATION] === VddkSetupMode.CopyAppliance;
