import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { onConfirmVmInstanceType } from '../utils';

const mockK8sPatch = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn((...args) => mockK8sPatch(...args)),
}));

const createMockPlan = (vms: Record<string, unknown>[]): V1beta1Plan =>
  ({
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: { name: 'test-plan', namespace: 'test-ns' },
    spec: { vms },
  }) as unknown as V1beta1Plan;

describe('onConfirmVmInstanceType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockResolvedValue({});
  });

  it('sends an ADD patch when setting instance type on a VM without one', async () => {
    const plan = createMockPlan([{ id: 'vm-1', name: 'my-vm' }]);

    await onConfirmVmInstanceType(0)({ newValue: 'cx1.2xlarge', resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/vms/0/instanceType', value: 'cx1.2xlarge' }],
      }),
    );
  });

  it('sends a REPLACE patch when changing an existing instance type', async () => {
    const plan = createMockPlan([{ id: 'vm-1', instanceType: 'u1.medium', name: 'my-vm' }]);

    await onConfirmVmInstanceType(0)({ newValue: 'cx1.2xlarge', resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/vms/0/instanceType', value: 'cx1.2xlarge' }],
      }),
    );
  });

  it('sends a REMOVE patch when clearing an existing instance type', async () => {
    const plan = createMockPlan([{ id: 'vm-1', instanceType: 'u1.medium', name: 'my-vm' }]);

    await onConfirmVmInstanceType(0)({ newValue: undefined, resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'remove', path: '/spec/vms/0/instanceType' }],
      }),
    );
  });

  it('returns the resource unchanged when newValue and current are both undefined', async () => {
    const plan = createMockPlan([{ id: 'vm-1', name: 'my-vm' }]);

    const result = await onConfirmVmInstanceType(0)({ newValue: undefined, resource: plan });

    expect(mockK8sPatch).not.toHaveBeenCalled();
    expect(result).toBe(plan);
  });

  it('uses the correct VM index in the patch path', async () => {
    const plan = createMockPlan([
      { id: 'vm-1', name: 'first' },
      { id: 'vm-2', name: 'second' },
    ]);

    await onConfirmVmInstanceType(1)({ newValue: 'cx1.large', resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/vms/1/instanceType', value: 'cx1.large' }],
      }),
    );
  });
});
