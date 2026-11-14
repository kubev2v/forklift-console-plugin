import type { V1beta1Provider } from '@forklift-ui/types';
import { getAnnotation, getVddkInitImage } from '@utils/crds/common/selectors';

import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from './constants';

/**
 * Single source of truth for the configured disk transfer method.
 *
 * Precedence: an explicit VDDK init image wins over an existing copy appliance
 * template, which wins over the persisted UI annotation, so the create wizard and
 * the provider details page always agree on what is configured.
 */
export const getDiskTransferMethod = (
  provider: V1beta1Provider,
  templateExists: boolean,
): VddkSetupMode => {
  if (getVddkInitImage(provider)?.trim()) {
    return VddkSetupMode.Manual;
  }
  if (templateExists) {
    return VddkSetupMode.CopyAppliance;
  }
  if (getAnnotation(provider, DISK_TRANSFER_METHOD_ANNOTATION) === VddkSetupMode.CopyAppliance) {
    return VddkSetupMode.CopyAppliance;
  }
  return VddkSetupMode.Skip;
};
