import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';

import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';

import { buildConversionCR } from '../buildConversionCR';

export const provider = {
  metadata: { name: 'vsphere', namespace: 'openshift-mtv', uid: 'provider-uid' },
  spec: {
    secret: { name: 'vsphere-secret', namespace: 'openshift-mtv' },
    settings: { vddkInitImage: 'quay.io/vddk:latest' },
    type: 'vsphere',
  },
} as unknown as V1beta1Provider;

export const plan = {
  metadata: { name: 'plan-a', namespace: 'plans-ns', uid: 'plan-uid' },
} as unknown as V1beta1Plan;

export const expectedBaseLabels = {
  [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
  [CONVERSION_LABELS.PROVIDER]: 'provider-uid',
  [CONVERSION_LABELS.VM_ID]: 'vm-1',
};

export const buildArgs = (
  overrides: Partial<Parameters<typeof buildConversionCR>[0]> = {},
): Parameters<typeof buildConversionCR>[0] => ({
  provider,
  vmId: 'vm-1',
  vmName: 'My VM',
  ...overrides,
});
