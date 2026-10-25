import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { getAnnotation, getVddkInitImage } from '@utils/crds/common/selectors';

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
