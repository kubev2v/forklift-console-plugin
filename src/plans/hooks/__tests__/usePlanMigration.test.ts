import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

const mockUseK8sWatchResource = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: jest.fn((...args: unknown[]) => mockUseK8sWatchResource(...args)),
}));

// eslint-disable-next-line import/first
import { usePlanMigration } from '../usePlanMigration';

const PLAN_UID = 'plan-uid-123';

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-ns', uid: PLAN_UID },
} as unknown as V1beta1Plan;

const buildMigration = (overrides: Partial<V1beta1Migration> = {}): V1beta1Migration =>
  ({
    ...overrides,
    metadata: {
      name: 'test-migration',
      namespace: 'test-ns',
      ownerReferences: [{ uid: PLAN_UID }],
      ...overrides.metadata,
    },
    status: {
      conditions: [{ status: 'True', type: 'Running' }],
      ...overrides.status,
    },
  }) as unknown as V1beta1Migration;

describe('usePlanMigration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns undefined when no migrations are loaded yet', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false, undefined]);

    const { result } = renderHook(() => usePlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
    expect(result.current[1]).toBe(false);
  });

  it('returns undefined when there is a load error', () => {
    const loadError = new Error('boom');
    mockUseK8sWatchResource.mockReturnValue([[buildMigration()], true, loadError]);

    const { result } = renderHook(() => usePlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
    expect(result.current[2]).toBe(loadError);
  });

  it('ignores migrations owned by a different plan', () => {
    const otherPlansMigration = buildMigration({
      metadata: {
        name: 'other',
        namespace: 'test-ns',
        ownerReferences: [{ uid: 'some-other-uid' }],
      },
    });
    mockUseK8sWatchResource.mockReturnValue([[otherPlansMigration], true, undefined]);

    const { result } = renderHook(() => usePlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
  });

  it('ignores an owned migration that is not Running', () => {
    const pendingMigration = buildMigration({
      status: { conditions: [{ status: 'False', type: 'Running' }] },
    });
    mockUseK8sWatchResource.mockReturnValue([[pendingMigration], true, undefined]);

    const { result } = renderHook(() => usePlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
  });

  it('returns the owned migration with a Running=True condition', () => {
    const runningMigration = buildMigration();
    mockUseK8sWatchResource.mockReturnValue([[runningMigration], true, undefined]);

    const { result } = renderHook(() => usePlanMigration(mockPlan));

    expect(result.current[0]).toBe(runningMigration);
    expect(result.current[1]).toBe(true);
    expect(result.current[2]).toBeUndefined();
  });

  it('picks the owned+Running migration out of several unrelated ones', () => {
    const otherPlansMigration = buildMigration({
      metadata: {
        name: 'other',
        namespace: 'test-ns',
        ownerReferences: [{ uid: 'some-other-uid' }],
      },
    });
    const ownedButNotRunning = buildMigration({
      metadata: {
        name: 'owned-not-running',
        namespace: 'test-ns',
        ownerReferences: [{ uid: PLAN_UID }],
      },
      status: { conditions: [{ status: 'False', type: 'Running' }] },
    });
    const ownedAndRunning = buildMigration({
      metadata: {
        name: 'owned-running',
        namespace: 'test-ns',
        ownerReferences: [{ uid: PLAN_UID }],
      },
    });
    mockUseK8sWatchResource.mockReturnValue([
      [otherPlansMigration, ownedButNotRunning, ownedAndRunning],
      true,
      undefined,
    ]);

    const { result } = renderHook(() => usePlanMigration(mockPlan));

    expect(result.current[0]).toBe(ownedAndRunning);
  });
});
