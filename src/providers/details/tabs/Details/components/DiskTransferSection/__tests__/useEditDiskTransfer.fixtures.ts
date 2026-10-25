import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';

export const provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: {
    annotations: { [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance },
    name: 'source',
    namespace: 'ns',
  },
  spec: {
    secret: { name: 'source-secret', namespace: 'ns' },
    type: 'vsphere',
    settings: {
      copyApplianceDatastore: 'datastore',
      copyApplianceFolder: '/folder',
      copyApplianceNetwork: 'network',
      copyApplianceResourcePool: '/pool',
    },
  },
} as V1beta1Provider;
export const template = {
  metadata: { name: 'source-copy-appliance-template', namespace: 'ns' },
} as V1beta1CopyApplianceTemplate;
export const props = { provider, templateLookupUnavailable: false };
