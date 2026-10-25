import type { V1beta1Provider } from '@forklift-ui/types';
import { getUseVddkAioOptimization, getVddkInitImage } from '@utils/crds/common/selectors';
import {
  getCopyApplianceDatastore,
  getCopyApplianceFolder,
  getCopyApplianceNetwork,
  getCopyApplianceResourcePool,
} from '@utils/crds/providers/selectors';

import { getDiskTransferMethod } from './getDiskTransferMethod';
import type { DiskTransferFormValues } from './types';

export const getDiskTransferDefaultValues = (
  provider: V1beta1Provider,
  templateExists: boolean,
): DiskTransferFormValues => ({
  aioEnabled: getUseVddkAioOptimization(provider) === 'true',
  confirmedDeletion: false,
  method: getDiskTransferMethod(provider, templateExists),
  placement: {
    datastore: getCopyApplianceDatastore(provider) ?? '',
    folder: getCopyApplianceFolder(provider) ?? '',
    network: getCopyApplianceNetwork(provider) ?? '',
    resourcePool: getCopyApplianceResourcePool(provider) ?? '',
  },
  vddkImage: getVddkInitImage(provider) ?? '',
});
