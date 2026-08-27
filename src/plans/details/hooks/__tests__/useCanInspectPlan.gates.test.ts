import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react-hooks';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { useCanInspectPlan } from '../useCanInspectPlan';

const mockUsePlanSourceProvider = jest.fn();

jest.mock('../usePlanSourceProvider', (): unknown => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUsePlanSourceProvider(...args),
}));

jest.mock('@utils/i18n', (): unknown => ({
  t: (key: string) => key,
  useForkliftTranslation: () => ({ t: (key: string) => key }),
}));

const readyVsphere = {
  spec: {
    settings: { vddkInitImage: 'quay.io/vddk:latest' },
    type: PROVIDER_TYPES.vsphere,
  },
  status: {
    conditions: [{ status: CONDITION_STATUS.TRUE, type: CATEGORY_TYPES.READY }],
  },
} as unknown as V1beta1Provider;

const basePlan = { metadata: { name: 'plan-1' }, spec: {} } as unknown as V1beta1Plan;

describe('useCanInspectPlan - gates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanSourceProvider.mockReturnValue({ loaded: true, sourceProvider: readyVsphere });
  });

  it('allows inspection for a ready vSphere plan with VDDK', () => {
    const { result } = renderHook(() => useCanInspectPlan(basePlan));

    expect(result.current).toEqual({
      canInspect: true,
      disabledReason: undefined,
      isVsphere: true,
      provider: readyVsphere,
    });
  });

  it('disables without reason for non-vSphere providers', () => {
    mockUsePlanSourceProvider.mockReturnValue({
      loaded: true,
      sourceProvider: { ...readyVsphere, spec: { ...readyVsphere.spec, type: 'ovirt' } },
    });

    const { result } = renderHook(() => useCanInspectPlan(basePlan));

    expect(result.current.canInspect).toBe(false);
    expect(result.current.isVsphere).toBe(false);
    expect(result.current.disabledReason).toBeUndefined();
  });

  it('requires a Ready source provider', () => {
    mockUsePlanSourceProvider.mockReturnValue({
      loaded: true,
      sourceProvider: {
        ...readyVsphere,
        status: { conditions: [{ status: CONDITION_STATUS.FALSE, type: CATEGORY_TYPES.READY }] },
      },
    });

    const { result } = renderHook(() => useCanInspectPlan(basePlan));

    expect(result.current).toMatchObject({
      canInspect: false,
      disabledReason: 'Source provider is not ready.',
    });
  });

  it('requires a configured VDDK image', () => {
    mockUsePlanSourceProvider.mockReturnValue({
      loaded: true,
      sourceProvider: {
        ...readyVsphere,
        spec: { type: PROVIDER_TYPES.vsphere, settings: {} },
      },
    });

    const { result } = renderHook(() => useCanInspectPlan(basePlan));

    expect(result.current.disabledReason).toMatch(/VDDK image is required/);
  });

  it.each([
    [
      'executing',
      {
        status: {
          conditions: [{ status: CONDITION_STATUS.TRUE, type: CATEGORY_TYPES.EXECUTING }],
        },
      },
      'Cannot inspect VMs while migration is in progress.',
    ],
    [
      'archived',
      { spec: { archived: true }, status: { conditions: [] } },
      'Cannot inspect VMs in an archived plan.',
    ],
    [
      'succeeded',
      {
        status: {
          conditions: [{ status: CONDITION_STATUS.TRUE, type: CATEGORY_TYPES.SUCCEEDED }],
        },
      },
      'VMs in a completed migration cannot be inspected.',
    ],
  ] as const)('blocks %s plans', (_label, planPatch, reason) => {
    const plan = { ...basePlan, ...planPatch } as unknown as V1beta1Plan;
    const { result } = renderHook(() => useCanInspectPlan(plan));

    expect(result.current).toMatchObject({ canInspect: false, disabledReason: reason });
  });
});
