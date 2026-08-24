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

describe('useOwnerPlanActionGate - watching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);
    mockIsPlanEditable.mockReturnValue(true);
    mockGetPlanStatus.mockReturnValue('Ready');
  });

  it('finds Plan owner even when not at index 0', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);

    const resource = createResourceWithOwner({
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Migration',
          name: 'mig-1',
          uid: 'uid-0',
        },
        planOwnerReference('plan-2'),
      ],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(mockUseK8sWatchResource).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'plan-2', namespace: 'ns1' }),
    );
  });

  it('watches the correct Plan by name and namespace', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);

    const resource = createResourceWithOwner({
      namespace: 'test-ns',
      ownerReferences: [planOwnerReference('my-plan', 'uid-2')],
    });
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
