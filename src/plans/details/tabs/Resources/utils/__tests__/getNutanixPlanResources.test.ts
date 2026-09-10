import type { NutanixVM } from '@forklift-ui/types';

import { getNutanixPlanResources } from '../getNutanixPlanResources';

const buildNutanixVm = (overrides: Partial<NutanixVM> = {}): NutanixVM =>
  ({
    id: 'vm-1',
    memorySizeMib: 8192,
    name: 'test-vm',
    numSockets: 2,
    numVcpusPerSocket: 4,
    powerState: 'ON',
    providerType: 'nutanix',
    ...overrides,
  }) as NutanixVM;

describe('getNutanixPlanResources', () => {
  it('aggregates utilization when providerType is omitted from inventory API', () => {
    const vmWithoutProviderType = buildNutanixVm({ providerType: undefined });

    const result = getNutanixPlanResources([vmWithoutProviderType]);

    expect(result.planInventorySize).toBe(1);
    expect(result.planInventoryRunningSize).toBe(1);
    expect(result.totalResources).toEqual({ cpuCount: 8, memoryMB: 8192 });
    expect(result.totalResourcesRunning).toEqual({ cpuCount: 8, memoryMB: 8192 });
  });

  it('excludes powered-off VMs from running totals', () => {
    const result = getNutanixPlanResources([
      buildNutanixVm({ id: 'on', powerState: 'ON' }),
      buildNutanixVm({ id: 'off', memorySizeMib: 4096, powerState: 'OFF' }),
    ]);

    expect(result.planInventorySize).toBe(2);
    expect(result.planInventoryRunningSize).toBe(1);
    expect(result.totalResources).toEqual({ cpuCount: 16, memoryMB: 12288 });
    expect(result.totalResourcesRunning).toEqual({ cpuCount: 8, memoryMB: 8192 });
  });
});
