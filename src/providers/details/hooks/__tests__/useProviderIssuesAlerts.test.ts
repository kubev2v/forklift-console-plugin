import type { V1beta1Provider } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import useProviderIssuesAlerts from '../useProviderIssuesAlerts';

const providerWithConditions = (conditions: Record<string, unknown>[]): V1beta1Provider =>
  ({
    metadata: { name: 'provider-1', namespace: 'openshift-mtv' },
    status: { conditions },
  }) as unknown as V1beta1Provider;

describe('useProviderIssuesAlerts', () => {
  it('returns elevated Critical and Warn conditions only', () => {
    const provider = providerWithConditions([
      { category: CATEGORY_TYPES.CRITICAL, status: CONDITION_STATUS.TRUE, type: 'UrlNotValid' },
      {
        category: CATEGORY_TYPES.WARNING,
        status: CONDITION_STATUS.TRUE,
        type: 'ConnectionInsecure',
      },
      { category: 'Advisory', status: CONDITION_STATUS.TRUE, type: 'Validated' },
    ]);

    const { result } = renderHook(() => useProviderIssuesAlerts(provider));

    expect(result.current.elevatedConditions).toHaveLength(2);
    expect(result.current.hasCriticalElevatedConditions).toBe(true);
    expect(result.current.showElevatedConditions).toBe(true);
  });

  it('returns hasCriticalElevatedConditions false for warn-only conditions', () => {
    const provider = providerWithConditions([
      {
        category: CATEGORY_TYPES.WARNING,
        status: CONDITION_STATUS.TRUE,
        type: 'ConnectionInsecure',
      },
    ]);

    const { result } = renderHook(() => useProviderIssuesAlerts(provider));

    expect(result.current.elevatedConditions).toHaveLength(1);
    expect(result.current.hasCriticalElevatedConditions).toBe(false);
    expect(result.current.showElevatedConditions).toBe(true);
  });

  it('returns showElevatedConditions false when no elevated conditions', () => {
    const provider = providerWithConditions([
      { category: 'Advisory', status: CONDITION_STATUS.TRUE, type: 'Validated' },
    ]);

    const { result } = renderHook(() => useProviderIssuesAlerts(provider));

    expect(result.current.elevatedConditions).toHaveLength(0);
    expect(result.current.hasCriticalElevatedConditions).toBe(false);
    expect(result.current.showElevatedConditions).toBe(false);
  });
});
