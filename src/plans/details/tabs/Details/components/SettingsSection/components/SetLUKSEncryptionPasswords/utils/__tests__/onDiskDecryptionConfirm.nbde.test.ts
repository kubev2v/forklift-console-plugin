import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));
const mockK8sCreate = jest.fn((..._args: unknown[]) => Promise.resolve({}));
const mockK8sDelete = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: never[]): unknown => mockK8sCreate(...args),
  k8sDelete: (...args: never[]): unknown => mockK8sDelete(...args),
  k8sPatch: (...args: never[]): unknown => mockK8sPatch(...args),
}));

import { onDiskDecryptionConfirm } from '../utils';

type PatchArg = { data: { op: string; path: string; value?: unknown }[] };

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

const findPlanVmsPatch = (): PatchArg | undefined => {
  const calls = mockK8sPatch.mock.calls as unknown as [PatchArg][];
  return calls.map(([arg]) => arg).find((arg) => arg.data.some((op) => op.path === '/spec/vms'));
};

describe('onDiskDecryptionConfirm nbde and empty paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockImplementation(() => Promise.resolve({}));
    mockK8sDelete.mockImplementation(() => Promise.resolve({}));
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
    mockK8sCreate.mockImplementation(() =>
      Promise.resolve({
        metadata: { name: 'empty-plan-luks', namespace: 'test-ns' },
      }),
    );

    await onDiskDecryptionConfirm({
      nbdeClevis: false,
      newValue: JSON.stringify(['pass']),
      resource: emptyVmsPlan,
    });

    const vmsPatch = findPlanVmsPatch();
    expect(vmsPatch?.data[0]?.op).toBe('replace');
    expect(vmsPatch?.data[0]?.value).toEqual([]);
  });

  it('skips create/delete/patch when labeled source already matches existing secret', async () => {
    const existingSecret = {
      data: { '0': btoa('secret') },
      metadata: { name: 'shared-luks', namespace: 'test-ns' },
    } as IoK8sApiCoreV1Secret;

    await expect(
      onDiskDecryptionConfirm({
        existingSecret,
        labeledSourceSecretName: 'shared-luks',
        nbdeClevis: false,
        newValue: JSON.stringify([]),
        resource: plan,
      }),
    ).resolves.toBeUndefined();

    expect(mockK8sCreate).not.toHaveBeenCalled();
    expect(mockK8sDelete).not.toHaveBeenCalled();
    expect(mockK8sPatch).not.toHaveBeenCalled();
  });

  it('copies existing secret onto VMs and forces nbdeClevis false', async () => {
    const existingSecret = {
      data: { '0': btoa('secret') },
      metadata: { name: 'shared-luks', namespace: 'test-ns' },
    } as IoK8sApiCoreV1Secret;

    mockK8sCreate.mockImplementation(() =>
      Promise.resolve({
        metadata: { name: 'test-plan-copy', namespace: 'test-ns' },
      }),
    );

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
