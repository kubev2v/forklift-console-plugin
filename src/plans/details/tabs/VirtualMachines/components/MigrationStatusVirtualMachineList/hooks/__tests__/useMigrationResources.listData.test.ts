import type { V1beta1Plan } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useMigrationResources } from '../useMigrationResources';

const mockUseK8sWatchResource = jest.fn();
const mockUseLatestPlanMigration = jest.fn();

jest.mock('@utils/hooks/useK8sWatchResource', (): unknown => ({
  useK8sWatchResource: (...args: unknown[]) => mockUseK8sWatchResource(...args),
}));

jest.mock('src/plans/hooks/useLatestPlanMigration', (): unknown => ({
  useLatestPlanMigration: (...args: unknown[]) => mockUseLatestPlanMigration(...args),
}));

const PLAN_UID = 'plan-uid';
const MIGRATION_UID = 'mig-uid';

const plan = {
  metadata: { name: 'plan-1', namespace: 'openshift-mtv', uid: PLAN_UID },
  spec: {
    targetNamespace: 'target-ns',
    warm: true,
    vms: [{ id: 'vm-1', name: 'alpha' }, { name: 'bravo-by-name' }],
  },
  status: {
    migration: {
      vms: [
        { id: 'vm-1', name: 'alpha', phase: 'DiskTransfer' },
        { id: 'vm-2', name: 'bravo-by-name', phase: 'DiskTransfer' },
      ],
    },
  },
} as unknown as V1beta1Plan;

const labeled = (
  kind: string,
  vmID: string,
  name: string,
): { kind: string; metadata: { labels: { vmID: string }; name: string } } => ({
  metadata: { labels: { vmID }, name },
  kind,
});

describe('useMigrationResources - listData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLatestPlanMigration.mockReturnValue([
      { metadata: { uid: MIGRATION_UID } },
      true,
      undefined,
    ]);
    mockUseK8sWatchResource
      .mockReturnValueOnce([
        [labeled('Pod', 'vm-1', 'pod-1'), labeled('Pod', 'vm-2', 'pod-2')],
        true,
        null,
      ])
      .mockReturnValueOnce([[labeled('Job', 'vm-1', 'job-1')], true, null])
      .mockReturnValueOnce([[labeled('PersistentVolumeClaim', 'vm-1', 'pvc-1')], true, null])
      .mockReturnValueOnce([[labeled('DataVolume', 'vm-1', 'dv-1')], true, null]);
  });

  it('groups watched resources onto matching VMs and resolves name-only VMs', () => {
    const { result } = renderHook(() => useMigrationResources(plan));

    expect(result.current.loaded).toBe(true);
    expect(result.current.migrationListData).toHaveLength(2);

    const [withId, byName] = result.current.migrationListData;
    expect(withId).toMatchObject({
      isWarm: true,
      targetNamespace: 'target-ns',
      statusVM: { id: 'vm-1', phase: 'DiskTransfer' },
    });
    expect(withId.pods?.[0].metadata?.name).toBe('pod-1');
    expect(withId.jobs?.[0].metadata?.name).toBe('job-1');
    expect(withId.pvcs?.[0].metadata?.name).toBe('pvc-1');
    expect(withId.dvs?.[0].metadata?.name).toBe('dv-1');

    expect(byName.specVM).toEqual({ name: 'bravo-by-name' });
    expect(byName.statusVM).toMatchObject({ id: 'vm-2', name: 'bravo-by-name' });
    expect(byName.pods?.[0].metadata?.name).toBe('pod-2');
  });

  it('omits resource dicts while watches are still loading', () => {
    mockUseK8sWatchResource.mockReset();
    mockUseK8sWatchResource
      .mockReturnValueOnce([[labeled('Pod', 'vm-1', 'pod-1')], false, null])
      .mockReturnValueOnce([[], true, null])
      .mockReturnValueOnce([[], true, null])
      .mockReturnValueOnce([[], true, null]);

    const { result } = renderHook(() => useMigrationResources(plan));

    expect(result.current.loaded).toBe(false);
    expect(result.current.migrationListData[0].pods).toBeUndefined();
  });

  it('returns loaded with empty resource dicts when no migration exists', () => {
    mockUseLatestPlanMigration.mockReturnValue([undefined, true, undefined]);
    mockUseK8sWatchResource.mockReset();
    mockUseK8sWatchResource.mockReturnValue([[], true, null]);

    const { result } = renderHook(() => useMigrationResources(plan));

    expect(result.current.loaded).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.migrationListData[0].pods).toBeUndefined();
  });

  it('surfaces migration watch errors', () => {
    const migrationError = new Error('migration watch failed');
    mockUseLatestPlanMigration.mockReturnValue([undefined, true, migrationError]);
    mockUseK8sWatchResource.mockReset();
    mockUseK8sWatchResource.mockReturnValue([[], true, null]);

    const { result } = renderHook(() => useMigrationResources(plan));

    expect(result.current.error).toBe(migrationError);
    expect(result.current.loaded).toBe(true);
  });

  it('surfaces resource watch errors and omits failed resource dicts', () => {
    const podsError = new Error('pods watch failed');
    mockUseK8sWatchResource.mockReset();
    mockUseK8sWatchResource
      .mockReturnValueOnce([[], true, podsError])
      .mockReturnValueOnce([[], true, null])
      .mockReturnValueOnce([[], true, null])
      .mockReturnValueOnce([[], true, null]);

    const { result } = renderHook(() => useMigrationResources(plan));

    expect(result.current.error).toBe(podsError);
    expect(result.current.migrationListData[0].pods).toBeUndefined();
  });
});
