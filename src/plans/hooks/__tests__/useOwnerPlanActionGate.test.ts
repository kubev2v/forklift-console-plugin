import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderHook } from '@testing-library/react';

import { useOwnerPlanActionGate } from '../useOwnerPlanActionGate';

mockI18n();

const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: (...args: unknown[]) => mockUseK8sWatchResource(...args),
}));

const mockIsPlanEditable = jest.fn();
const mockGetPlanStatus = jest.fn();

jest.mock('src/plans/details/components/PlanStatus/utils/utils', () => ({
  getPlanStatus: (...args: unknown[]) => mockGetPlanStatus(...args),
  isPlanEditable: (...args: unknown[]) => mockIsPlanEditable(...args),
}));

describe('useOwnerPlanActionGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);
    mockIsPlanEditable.mockReturnValue(true);
    mockGetPlanStatus.mockReturnValue('Ready');
  });

  it('returns unblocked when resource has no ownerReferences', () => {
    const resource = { metadata: { name: 'map1', namespace: 'ns1' } };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
    expect(mockUseK8sWatchResource).toHaveBeenCalledWith(null);
  });

  it('returns unblocked when owner kind is not Plan', () => {
    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Migration',
            name: 'mig-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });

  it('returns blocked (fail-closed) while Plan is loading', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Checking plan status…');
  });

  it('returns unblocked when Plan is loaded and editable', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' }, status: {} };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(true);

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });

  it('returns blocked with reason when Plan is Archived', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' }, spec: { archived: true } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Archived');

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is archived');
  });

  it('returns blocked with reason when Plan is Executing', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Executing');

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is currently migrating');
  });

  it('returns blocked with reason when Plan is Completed', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Completed');

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan has completed');
  });

  it('returns blocked with reason when Plan is Paused', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Paused');

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is currently migrating');
  });

  it('returns blocked with reason when Plan is Pending', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Pending');

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is currently migrating');
  });

  it('returns generic blocked reason for other non-editable statuses', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('CannotStart');

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-1',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan cannot be modified');
  });

  it('finds Plan owner even when not at index 0', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'ns1',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Migration',
            name: 'mig-1',
            uid: 'uid-0',
          },
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'plan-2',
            uid: 'uid-1',
          },
        ],
      },
    };
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(mockUseK8sWatchResource).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'plan-2', namespace: 'ns1' }),
    );
  });

  it('returns unblocked when resource is undefined', () => {
    const { result } = renderHook(() => useOwnerPlanActionGate(undefined));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });

  it('watches the correct Plan by name and namespace', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);

    const resource = {
      metadata: {
        name: 'map1',
        namespace: 'test-ns',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: 'my-plan',
            uid: 'uid-2',
          },
        ],
      },
    };
    renderHook(() => useOwnerPlanActionGate(resource));

    expect(mockUseK8sWatchResource).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my-plan',
        namespace: 'test-ns',
        namespaced: true,
      }),
    );
  });
});
