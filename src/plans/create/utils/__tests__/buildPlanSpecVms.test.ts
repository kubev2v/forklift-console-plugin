import type { ProviderVirtualMachine } from 'src/plans/create/types';

import { describe, expect, it } from '@jest/globals';

import { buildPlanSpecVms } from '../buildPlanSpecVms';

const createMockVm = (overrides: Partial<ProviderVirtualMachine> = {}): ProviderVirtualMachine =>
  ({
    id: 'vm-1',
    name: 'test-vm',
    providerType: 'vsphere',
    ...overrides,
  }) as unknown as ProviderVirtualMachine;

describe('buildPlanSpecVms', () => {
  it('applies instance type to a VM when provided', () => {
    const vms = [createMockVm({ id: 'vm-1' })];

    const result = buildPlanSpecVms({
      instanceTypes: { 'vm-1': 'cx1.2xlarge' },
      vms,
    });

    expect(result[0].instanceType).toBe('cx1.2xlarge');
  });

  it('does not set instance type when not provided for a VM', () => {
    const vms = [createMockVm({ id: 'vm-1' }), createMockVm({ id: 'vm-2', name: 'other-vm' })];

    const result = buildPlanSpecVms({
      instanceTypes: { 'vm-1': 'cx1.2xlarge' },
      vms,
    });

    expect(result[0].instanceType).toBe('cx1.2xlarge');
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
