import type { V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { onConfirmMigrateSharedDisks, onConfirmVmMigrateSharedDisks } from '../utils';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn(),
}));

const mockPatch = k8sPatch as jest.MockedFunction<typeof k8sPatch>;

const basePlan = {
  metadata: { name: 'plan-1', namespace: 'ns' },
  spec: {
    vms: [{ id: 'vm-1', name: 'alpha' }, { id: 'vm-2', migrateSharedDisks: true }],
  },
} as unknown as V1beta1Plan;

describe('onConfirmMigrateSharedDisks - patch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatch.mockResolvedValue(basePlan);
  });

  it('ADDs migrateSharedDisks when unset on the plan', async () => {
    await onConfirmMigrateSharedDisks({ newValue: false, resource: basePlan });

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/migrateSharedDisks', value: false }],
      }),
    );
  });

  it('REPLACEs when the plan already has migrateSharedDisks', async () => {
    const withFlag = {
      ...basePlan,
      spec: { ...basePlan.spec, migrateSharedDisks: true },
    } as unknown as V1beta1Plan;

    await onConfirmMigrateSharedDisks({ newValue: false, resource: withFlag });

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/migrateSharedDisks', value: false }],
      }),
    );
  });
});

describe('onConfirmVmMigrateSharedDisks - patch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatch.mockResolvedValue(basePlan);
  });

  it('no-ops when clearing an already-unset VM field', async () => {
    const result = await onConfirmVmMigrateSharedDisks(0)({
      newValue: undefined,
      resource: basePlan,
    });

    expect(result).toBe(basePlan);
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('REMOVEs an existing VM migrateSharedDisks when cleared', async () => {
    await onConfirmVmMigrateSharedDisks(1)({ newValue: undefined, resource: basePlan });

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'remove', path: '/spec/vms/1/migrateSharedDisks' }],
      }),
    );
  });

  it('ADDs then REPLACEs VM-level migrateSharedDisks', async () => {
    await onConfirmVmMigrateSharedDisks(0)({ newValue: false, resource: basePlan });
    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/vms/0/migrateSharedDisks', value: false }],
      }),
    );

    await onConfirmVmMigrateSharedDisks(1)({ newValue: false, resource: basePlan });
    expect(mockPatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/vms/1/migrateSharedDisks', value: false }],
      }),
    );
  });
});
