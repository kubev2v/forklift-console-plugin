import type { ProviderVirtualMachine } from 'src/plans/create/types';

import { describe, expect, it } from '@jest/globals';

import { buildPlanSpecVms } from '../buildPlanSpecVms';

const MOCK_VM_ID = 'vm-1';
const MOCK_INSTANCE_TYPE = 'cx1.2xlarge';

const createMockVm = (overrides: Partial<ProviderVirtualMachine> = {}): ProviderVirtualMachine =>
  ({
    id: MOCK_VM_ID,
    name: 'test-vm',
    providerType: 'vsphere',
    ...overrides,
  }) as unknown as ProviderVirtualMachine;

describe('buildPlanSpecVms', () => {
  it('applies instance type to a VM when provided', () => {
    const vms = [createMockVm({ id: MOCK_VM_ID })];

    const result = buildPlanSpecVms({
      instanceTypes: { [MOCK_VM_ID]: MOCK_INSTANCE_TYPE },
      vms,
    });

    expect(result[0].instanceType).toBe(MOCK_INSTANCE_TYPE);
  });

  it('does not set instance type when not provided for a VM', () => {
    const vms = [createMockVm({ id: MOCK_VM_ID }), createMockVm({ id: 'vm-2', name: 'other-vm' })];

    const result = buildPlanSpecVms({
      instanceTypes: { [MOCK_VM_ID]: MOCK_INSTANCE_TYPE },
      vms,
    });

    expect(result[0].instanceType).toBe(MOCK_INSTANCE_TYPE);
    expect(result[1].instanceType).toBeUndefined();
  });

  it('does not set instance type when instanceTypes map is undefined', () => {
    const vms = [createMockVm()];

    const result = buildPlanSpecVms({ vms });

    expect(result[0].instanceType).toBeUndefined();
  });

  it('does not set instance type when instanceTypes map is empty', () => {
    const vms = [createMockVm()];

    const result = buildPlanSpecVms({ instanceTypes: {}, vms });

    expect(result[0].instanceType).toBeUndefined();
  });
});
