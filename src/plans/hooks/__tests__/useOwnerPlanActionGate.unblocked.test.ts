import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderHook } from '@testing-library/react';

import './useOwnerPlanActionGate.mocks';

import { useOwnerPlanActionGate } from '../useOwnerPlanActionGate';

import { createResourceWithOwner, planOwnerReference } from './useOwnerPlanActionGate.fixtures';
import {
  mockGetPlanStatus,
  mockIsPlanEditable,
  mockUseK8sWatchResource,
} from './useOwnerPlanActionGate.mocks';

mockI18n();

describe('useOwnerPlanActionGate - unblocked', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);
    mockIsPlanEditable.mockReturnValue(true);
    mockGetPlanStatus.mockReturnValue('Ready');
  });

  it('returns unblocked when resource has no ownerReferences', () => {
    const resource = createResourceWithOwner({});
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
    expect(mockUseK8sWatchResource).toHaveBeenCalledWith(null);
  });

  it('returns unblocked when owner kind is not Plan', () => {
    const resource = createResourceWithOwner({
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Migration',
          name: 'mig-1',
          uid: 'uid-1',
        },
      ],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });

  it('returns unblocked when Plan is loaded and editable', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' }, status: {} };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(true);

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });

  it('returns unblocked when resource is undefined', () => {
    const { result } = renderHook(() => useOwnerPlanActionGate(undefined));

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });
});
