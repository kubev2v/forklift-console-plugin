import type { V1beta1Plan } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useMigrationResources } from '../useMigrationResources';

const mockUseK8sWatchResource = jest.fn();
const mockUseLatestPlanMigration = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: jest.fn((...args: unknown[]) => mockUseK8sWatchResource(...args)),
}));

jest.mock('src/plans/hooks/useLatestPlanMigration', () => ({
  useLatestPlanMigration: jest.fn((...args: unknown[]) => mockUseLatestPlanMigration(...args)),
}));

jest.mock('../../../utils/utils', () => ({
  getPlanVirtualMachinesDict: jest.fn(() => ({})),
}));

jest.mock('../../../utils/getPlanVirtualMachineIdByName', () => ({
  getPlanVirtualMachineIdByName: jest.fn(),
}));

jest.mock('../../utils/utils', () => ({
  groupByVmId: jest.fn(() => ({})),
}));

const PLAN_UID = 'plan-uid-abc';
const MIGRATION_UID = 'migration-uid-xyz';
const TARGET_NS = 'openshift-mtv';

const mockPlan = {
  metadata: { name: 'mtv-6091-offload', namespace: 'openshift-mtv', uid: PLAN_UID },
  spec: {
    targetNamespace: TARGET_NS,
    vms: [{ id: 'vm-1008', name: 'mtv-tests-rhel8' }],
  },
} as unknown as V1beta1Plan;

describe('useMigrationResources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([[], true, undefined]);
  });

  it('disables resource watches when no latest migration exists', () => {
    mockUseLatestPlanMigration.mockReturnValue([undefined, true, undefined]);

    const { result } = renderHook(() => useMigrationResources(mockPlan));

    expect(mockUseK8sWatchResource).toHaveBeenCalledWith(null);
    expect(result.current.loaded).toBe(true);
    expect(result.current.migrationListData).toHaveLength(1);
  });

  it('scopes Pod/PVC/DV watches to plan and latest migration UIDs', () => {
    mockUseLatestPlanMigration.mockReturnValue([
      { metadata: { uid: MIGRATION_UID } },
      true,
      undefined,
    ]);

    renderHook(() => useMigrationResources(mockPlan));

    const watchCalls = mockUseK8sWatchResource.mock.calls.map((call) => call[0]);
    const nonNullWatches = watchCalls.filter(Boolean);

    expect(nonNullWatches.length).toBe(4);
    for (const watch of nonNullWatches) {
      expect(watch.selector.matchLabels).toEqual({
        migration: MIGRATION_UID,
        plan: PLAN_UID,
      });
    }
  });

  it('keeps Jobs watch in the plan namespace while still filtering by migration', () => {
    mockUseLatestPlanMigration.mockReturnValue([
      { metadata: { uid: MIGRATION_UID } },
      true,
      undefined,
    ]);

    renderHook(() => useMigrationResources(mockPlan));

    const jobWatch = mockUseK8sWatchResource.mock.calls
      .map((call) => call[0])
      .find((watch) => watch?.groupVersionKind?.kind === 'Job');

    expect(jobWatch).toMatchObject({
      namespace: 'openshift-mtv',
      selector: { matchLabels: { migration: MIGRATION_UID, plan: PLAN_UID } },
    });
  });
});
