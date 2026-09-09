import type { V1beta1Plan } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useSpecVirtualMachinesListData } from '../useSpecVirtualMachinesListData';

const mockUsePlanSourceProvider = jest.fn();
const mockUseInventoryVms = jest.fn();

jest.mock('src/plans/details/hooks/usePlanSourceProvider', () => ({
  __esModule: true,
  default: jest.fn((...args: unknown[]) => mockUsePlanSourceProvider(...args)),
}));

jest.mock('src/utils/hooks/useInventoryVms', () => ({
  useInventoryVms: jest.fn((...args: unknown[]) => mockUseInventoryVms(...args)),
}));

jest.mock('../../../utils/utils', () => ({
  getPlanVirtualMachinesDict: jest.fn(() => ({})),
}));

jest.mock('../../utils/utils', () => ({
  getPlanConditionsDict: jest.fn(() => ({})),
}));

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'openshift-mtv' },
  spec: {
    targetNamespace: 'target-ns',
    vms: [{ id: 'vm-1008', name: 'test-vm' }],
  },
} as unknown as V1beta1Plan;

const mockVmInventoryData = [
  {
    name: 'test-vm',
    namespace: 'source',
    vm: { id: 'vm-1008', name: 'test-vm' },
  },
];

describe('useSpecVirtualMachinesListData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanSourceProvider.mockReturnValue({
      sourceProvider: { spec: { type: 'vsphere' } },
    });
  });

  it('returns empty list while inventory is loading', () => {
    mockUseInventoryVms.mockReturnValue([[], true, null]);

    const { result } = renderHook(() => useSpecVirtualMachinesListData(mockPlan));

    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toBe(true);
    expect(result.current[2]).toBeNull();
  });

  it('returns empty list when inventory fails', () => {
    const inventoryError = new Error('inventory failed');
    mockUseInventoryVms.mockReturnValue([mockVmInventoryData, false, inventoryError]);

    const { result } = renderHook(() => useSpecVirtualMachinesListData(mockPlan));

    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toBe(false);
    expect(result.current[2]).toBe(inventoryError);
  });

  it('returns populated list on success', () => {
    mockUseInventoryVms.mockReturnValue([mockVmInventoryData, false, null]);

    const { result } = renderHook(() => useSpecVirtualMachinesListData(mockPlan));

    expect(result.current[0]).toHaveLength(1);
    expect(result.current[0][0]?.specVM?.id).toBe('vm-1008');
    expect(result.current[1]).toBe(false);
    expect(result.current[2]).toBeNull();
  });
});
