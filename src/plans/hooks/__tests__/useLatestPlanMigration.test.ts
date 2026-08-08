import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useLatestPlanMigration } from '../useLatestPlanMigration';

const mockUseK8sWatchResource = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: jest.fn((...args: unknown[]) => mockUseK8sWatchResource(...args)),
}));

const PLAN_UID = 'plan-uid-123';
const TEST_NAMESPACE = 'test-ns';
const DEFAULT_CREATION_TIMESTAMP = '2026-08-05T17:00:00Z';
const STARTED_NEWER = '2026-08-05T17:51:00Z';
const STARTED_OLDER = '2026-08-05T17:49:00Z';

const mockPlan = {
  metadata: { name: 'test-plan', namespace: TEST_NAMESPACE, uid: PLAN_UID },
} as unknown as V1beta1Plan;

type MigrationTestOverrides = {
  metadata?: {
    creationTimestamp?: string;
    name?: string;
    namespace?: string;
    ownerReferences?: { uid: string }[];
  };
  status?: {
    conditions?: { status: string; type: string }[];
    started?: string;
  };
};

const buildMigration = (overrides: MigrationTestOverrides = {}): V1beta1Migration =>
  ({
    ...overrides,
    metadata: {
      creationTimestamp: DEFAULT_CREATION_TIMESTAMP,
      name: 'test-migration',
      namespace: TEST_NAMESPACE,
      ownerReferences: [{ uid: PLAN_UID }],
      ...overrides.metadata,
    },
    status: {
      conditions: [{ status: 'False', type: 'Running' }],
      ...overrides.status,
    },
  }) as unknown as V1beta1Migration;

describe('useLatestPlanMigration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns undefined when migrations are not loaded yet', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false, undefined]);

    const { result } = renderHook(() => useLatestPlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
    expect(result.current[1]).toBe(false);
  });

  it('returns undefined when there is a load error', () => {
    const loadError = new Error('boom');
    mockUseK8sWatchResource.mockReturnValue([[buildMigration()], true, loadError]);

    const { result } = renderHook(() => useLatestPlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
    expect(result.current[2]).toBe(loadError);
  });

  it('ignores migrations owned by a different plan', () => {
    const otherPlansMigration = buildMigration({
      metadata: {
        name: 'other',
        namespace: TEST_NAMESPACE,
        ownerReferences: [{ uid: 'some-other-uid' }],
      },
    });
    mockUseK8sWatchResource.mockReturnValue([[otherPlansMigration], true, undefined]);

    const { result } = renderHook(() => useLatestPlanMigration(mockPlan));

    expect(result.current[0]).toBeUndefined();
  });

  it('returns a Failed owned migration (not only Running)', () => {
    const failedMigration = buildMigration({
      status: {
        conditions: [{ status: 'True', type: 'Failed' }],
        started: STARTED_OLDER,
      },
    });
    mockUseK8sWatchResource.mockReturnValue([[failedMigration], true, undefined]);

    const { result } = renderHook(() => useLatestPlanMigration(mockPlan));

    expect(result.current[0]).toBe(failedMigration);
  });

  it('picks the newest owned migration by status.started', () => {
    const older = buildMigration({
      metadata: { name: 'older', namespace: TEST_NAMESPACE, ownerReferences: [{ uid: PLAN_UID }] },
      status: { started: STARTED_OLDER },
    });
    const newer = buildMigration({
      metadata: { name: 'newer', namespace: TEST_NAMESPACE, ownerReferences: [{ uid: PLAN_UID }] },
      status: { started: STARTED_NEWER },
    });
    mockUseK8sWatchResource.mockReturnValue([[older, newer], true, undefined]);

    const { result } = renderHook(() => useLatestPlanMigration(mockPlan));

    expect(result.current[0]).toBe(newer);
  });

  it('falls back to creationTimestamp when status.started is missing', () => {
    const olderByCreation = buildMigration({
      metadata: {
        creationTimestamp: STARTED_OLDER,
        name: 'older-creation',
        namespace: TEST_NAMESPACE,
        ownerReferences: [{ uid: PLAN_UID }],
      },
      status: { conditions: [] },
    });
    const newerByCreation = buildMigration({
      metadata: {
        creationTimestamp: STARTED_NEWER,
        name: 'newer-creation',
        namespace: TEST_NAMESPACE,
        ownerReferences: [{ uid: PLAN_UID }],
      },
      status: { conditions: [] },
    });
    mockUseK8sWatchResource.mockReturnValue([[olderByCreation, newerByCreation], true, undefined]);

    const { result } = renderHook(() => useLatestPlanMigration(mockPlan));

    expect(result.current[0]).toBe(newerByCreation);
  });
});
