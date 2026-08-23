import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';

export const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-namespace' },
  spec: { vms: [] },
} as unknown as V1beta1Plan;

export const closeOverlay = jest.fn();

export const planOwnedSecretWithSourceLabel = {
  data: { '0': btoa('copied') },
  metadata: {
    labels: { [SOURCE_SECRET_LABEL]: 'luks-source' },
    name: 'test-secret',
    namespace: 'test-namespace',
  },
  type: 'Opaque',
} as IoK8sApiCoreV1Secret;

export const sourceSecret = {
  data: { '0': btoa('original') },
  metadata: { name: 'luks-source', namespace: 'test-namespace' },
  type: 'Opaque',
} as IoK8sApiCoreV1Secret;
