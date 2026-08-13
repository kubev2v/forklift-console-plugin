import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { onDiskDecryptionConfirm } from '../utils';

const mockK8sPatch = jest.fn();
const mockK8sCreate = jest.fn();
const mockK8sDelete = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn((...args) => mockK8sCreate(...args)),
  k8sDelete: jest.fn((...args) => mockK8sDelete(...args)),
  k8sPatch: jest.fn((...args) => mockK8sPatch(...args)),
}));

const plan = {
  metadata: { name: 'test-plan', namespace: 'test-ns', uid: 'plan-uid' },
  spec: {
    vms: [{ luks: { name: 'plan-owned-luks' }, name: 'vm-1' }],
  },
} as unknown as V1beta1Plan;

const labeledSource = {
  data: { '0': btoa('secret') },
  metadata: { name: 'luks-source', namespace: 'test-ns' },
  type: 'Opaque',
} as IoK8sApiCoreV1Secret;

describe('onDiskDecryptionConfirm no-op existing secret', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips copy and delete when selected secret already matches the labeled source', async () => {
    await onDiskDecryptionConfirm({
      existingSecret: labeledSource,
      labeledSourceSecretName: 'luks-source',
      nbdeClevis: false,
      newValue: JSON.stringify([]),
      resource: plan,
    });

    expect(mockK8sCreate).not.toHaveBeenCalled();
    expect(mockK8sDelete).not.toHaveBeenCalled();
    expect(mockK8sPatch).not.toHaveBeenCalled();
  });

  it('copies when selected secret differs from the labeled source', async () => {
    const otherSecret = {
      data: { '0': btoa('other') },
      metadata: { name: 'other-luks', namespace: 'test-ns' },
      type: 'Opaque',
    } as IoK8sApiCoreV1Secret;

    mockK8sCreate.mockResolvedValue({
      metadata: { name: 'test-plan-abc', namespace: 'test-ns' },
    });
    mockK8sDelete.mockResolvedValue(undefined);
    mockK8sPatch.mockResolvedValue(plan);

    await onDiskDecryptionConfirm({
      existingSecret: otherSecret,
      labeledSourceSecretName: 'luks-source',
      nbdeClevis: false,
      newValue: JSON.stringify([]),
      resource: plan,
    });

    expect(mockK8sCreate).toHaveBeenCalled();
    expect(mockK8sDelete).toHaveBeenCalled();
    expect(mockK8sPatch).toHaveBeenCalled();
  });
});
