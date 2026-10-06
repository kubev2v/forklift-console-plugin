import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { onConfirmVmExcludeDisks } from '../utils';

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

describe('onConfirmVmExcludeDisks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockResolvedValue({});
  });

  it('sends an ADD patch when setting excludeDisks on a VM without one', async () => {
    const plan = createMockPlan([{ id: 'vm-1', name: 'my-vm' }]);

    await onConfirmVmExcludeDisks(0)({ newValue: ['scsi0:1'], resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/vms/0/excludeDisks', value: ['scsi0:1'] }],
      }),
    );
  });

  it('sends a REPLACE patch when changing existing excludeDisks', async () => {
    const plan = createMockPlan([{ excludeDisks: ['scsi0:1'], id: 'vm-1', name: 'my-vm' }]);

    await onConfirmVmExcludeDisks(0)({ newValue: ['scsi0:1', 'scsi0:2'], resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'replace',
            path: '/spec/vms/0/excludeDisks',
            value: ['scsi0:1', 'scsi0:2'],
          },
        ],
      }),
    );
  });

  it('sends a REMOVE patch when clearing excludeDisks', async () => {
    const plan = createMockPlan([{ excludeDisks: ['scsi0:1'], id: 'vm-1', name: 'my-vm' }]);

    await onConfirmVmExcludeDisks(0)({ newValue: [], resource: plan });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'remove', path: '/spec/vms/0/excludeDisks' }],
      }),
    );
  });

  it('returns the resource unchanged when selection is unchanged', async () => {
    const plan = createMockPlan([{ excludeDisks: ['scsi0:1'], id: 'vm-1', name: 'my-vm' }]);

    const result = await onConfirmVmExcludeDisks(0)({
      newValue: ['scsi0:1'],
      resource: plan,
    });

    expect(mockK8sPatch).not.toHaveBeenCalled();
    expect(result).toBe(plan);
  });
});
