import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';

import type { V1beta1Plan } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useSpecVirtualMachinesListData } from '../useSpecVirtualMachinesListData';

const mockUsePlanSourceProvider = jest.fn();
const mockUseInventoryVms = jest.fn();

jest.mock('src/plans/details/hooks/usePlanSourceProvider', (): unknown => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUsePlanSourceProvider(...args),
}));

jest.mock('src/utils/hooks/useInventoryVms', (): unknown => ({
  useInventoryVms: (...args: unknown[]) => mockUseInventoryVms(...args),
}));

const sourceProvider = { spec: { type: 'vsphere' } };

const inventory: VmData[] = [
  { vm: { id: 'vm-1', name: 'alpha' } } as VmData,
  { vm: { id: 'vm-2', name: 'bravo' } } as VmData,
];

const plan = {
  metadata: { name: 'plan-1' },
  spec: {
    targetNamespace: 'target-ns',
    vms: [
      { name: 'missing-from-inventory' },
      { id: 'vm-1', name: 'alpha' },
      { name: 'bravo' },
      { id: 'vm-orphan', name: 'orphan' },
    ],
  },
  status: {
    conditions: [
      {
        items: ["id:vm-1 name:'alpha'"],
        type: 'VMConcerns',
      },
    ],
    migration: {
      vms: [{ id: 'vm-1', name: 'alpha', started: '2024-01-01T00:00:00Z' }],
    },
  },
} as unknown as V1beta1Plan;

describe('useSpecVirtualMachinesListData - mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanSourceProvider.mockReturnValue({ sourceProvider });
    mockUseInventoryVms.mockReturnValue([inventory, false, null]);
  });

  it('maps VMs by id or inventory name and preserves vmIndex gaps', () => {
    const { result } = renderHook(() => useSpecVirtualMachinesListData(plan));
    const [rows, loading, error] = result.current;

    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(rows).toHaveLength(2);

    expect(rows[0]).toMatchObject({
      inventoryVmData: inventory[0],
      sourceProviderType: 'vsphere',
      targetNamespace: 'target-ns',
      vmIndex: 1,
      statusVM: { id: 'vm-1' },
    });
    expect(rows[0].conditions?.[0].type).toBe('VMConcerns');

    expect(rows[1]).toMatchObject({
      inventoryVmData: inventory[1],
      vmIndex: 2,
      specVM: { name: 'bravo' },
    });
  });

  it('returns an empty list while inventory is loading', () => {
    mockUseInventoryVms.mockReturnValue([inventory, true, null]);

    const { result } = renderHook(() => useSpecVirtualMachinesListData(plan));

    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toBe(true);
  });

  it('returns an empty list for a non-empty error object', () => {
    mockUseInventoryVms.mockReturnValue([inventory, false, { message: 'inventory failed' }]);

    const { result } = renderHook(() => useSpecVirtualMachinesListData(plan));

    expect(result.current[0]).toEqual([]);
  });

  it('returns an empty list when inventory error is an Error instance', () => {
    mockUseInventoryVms.mockReturnValue([inventory, false, new Error('inventory failed')]);

    const { result } = renderHook(() => useSpecVirtualMachinesListData(plan));

    expect(result.current[0]).toEqual([]);
  });
});
