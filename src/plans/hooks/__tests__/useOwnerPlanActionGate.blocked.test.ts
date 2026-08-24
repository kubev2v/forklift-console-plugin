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

describe('useOwnerPlanActionGate - blocked', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);
    mockIsPlanEditable.mockReturnValue(true);
    mockGetPlanStatus.mockReturnValue('Ready');
  });

  it('returns blocked (fail-closed) while Plan is loading', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false]);

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Checking plan status…');
  });

  it('returns blocked with reason when Plan is Archived', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' }, spec: { archived: true } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Archived');

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is archived');
  });

  it('returns blocked with reason when Plan is Executing', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Executing');

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is currently migrating');
  });

  it('returns blocked with reason when Plan is Completed', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Completed');

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan has completed');
  });

  it('returns blocked with reason when Plan is Paused', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Paused');

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is currently migrating');
  });

  it('returns blocked with reason when Plan is Pending', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('Pending');

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan is currently migrating');
  });

  it('returns generic blocked reason for other non-editable statuses', () => {
    const plan = { metadata: { name: 'plan-1', namespace: 'ns1' } };
    mockUseK8sWatchResource.mockReturnValue([plan, true]);
    mockIsPlanEditable.mockReturnValue(false);
    mockGetPlanStatus.mockReturnValue('CannotStart');

    const resource = createResourceWithOwner({
      ownerReferences: [planOwnerReference('plan-1')],
    });
    const { result } = renderHook(() => useOwnerPlanActionGate(resource));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.disabledReason).toBe('Owning plan cannot be modified');
  });
});
