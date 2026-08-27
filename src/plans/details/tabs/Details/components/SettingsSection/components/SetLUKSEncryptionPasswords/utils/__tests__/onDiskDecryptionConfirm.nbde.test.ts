import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { onDiskDecryptionConfirm } from '../utils';

const mockK8sPatch = jest.fn();
const mockK8sCreate = jest.fn();
const mockK8sDelete = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn((...args: unknown[]) => mockK8sCreate(...args)),
  k8sDelete: jest.fn((...args: unknown[]) => mockK8sDelete(...args)),
  k8sPatch: jest.fn((...args: unknown[]) => mockK8sPatch(...args)),
}));

const plan = {
  metadata: { name: 'test-plan', namespace: 'test-ns', uid: 'plan-uid' },
  spec: {
    vms: [{ luks: { name: 'plan-owned-luks' }, name: 'vm-1' }],
  },
} as unknown as V1beta1Plan;

const emptyVmsPlan = {
  metadata: { name: 'empty-plan', namespace: 'test-ns', uid: 'uid-2' },
  spec: { vms: [] },
} as unknown as V1beta1Plan;

const findPlanVmsPatch = ():
  { data: { op: string; path: string; value?: unknown }[] } | undefined =>
  mockK8sPatch.mock.calls
    .map(([arg]) => arg as { data?: { op: string; path: string; value?: unknown }[] })
    .find((arg) => arg?.data?.some((op) => op.path === '/spec/vms'));

describe('onDiskDecryptionConfirm nbde and empty paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockResolvedValue(plan);
    mockK8sDelete.mockResolvedValue(undefined);
  });

  it('deletes LUKS secret and clears luks when nbdeClevis is true', async () => {
    await onDiskDecryptionConfirm({
      nbdeClevis: true,
      newValue: JSON.stringify(['ignored']),
      resource: plan,
    });

    expect(mockK8sDelete).toHaveBeenCalled();
    const vmsPatch = findPlanVmsPatch();
    expect(vmsPatch?.data[0]).toEqual({
      op: 'replace',
      path: '/spec/vms',
      value: [{ luks: undefined, name: 'vm-1', nbdeClevis: true }],
    });
  });

  it('still uses replace for empty VMs array (ADD branch is unreachable)', async () => {
    mockK8sCreate.mockResolvedValue({
      metadata: { name: 'empty-plan-luks', namespace: 'test-ns' },
    });

    await onDiskDecryptionConfirm({
      nbdeClevis: false,
      newValue: JSON.stringify(['pass']),
      resource: emptyVmsPlan,
    });

    const vmsPatch = findPlanVmsPatch();
    expect(vmsPatch?.data[0]?.op).toBe('replace');
    expect(vmsPatch?.data[0]?.value).toEqual([]);
  });

  it('copies existing secret onto VMs and forces nbdeClevis false', async () => {
    const existingSecret = {
      data: { '0': btoa('secret') },
      metadata: { name: 'shared-luks', namespace: 'test-ns' },
    } as IoK8sApiCoreV1Secret;

    mockK8sCreate.mockResolvedValue({
      metadata: { name: 'test-plan-copy', namespace: 'test-ns' },
    });

    await onDiskDecryptionConfirm({
      existingSecret,
      labeledSourceSecretName: 'other-source',
      nbdeClevis: true,
      newValue: JSON.stringify([]),
      resource: plan,
    });

    expect(mockK8sCreate).toHaveBeenCalled();
    expect(mockK8sDelete).toHaveBeenCalled();
    expect(findPlanVmsPatch()?.data[0]?.value).toEqual([
      { luks: { name: 'test-plan-copy' }, name: 'vm-1', nbdeClevis: false },
    ]);
  });
});
