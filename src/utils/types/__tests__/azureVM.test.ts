import { describe, expect, it } from '@jest/globals';

import {
  type AzureVM,
  getAzureDiskTypes,
  getAzureNicIds,
  getAzureNicLabel,
  getAzureVM,
  getAzureVmPowerState,
  isAzureVm,
} from '../azureVM';

const buildVm = (overrides: Partial<AzureVM> = {}): AzureVM => ({
  cpuCount: 2,
  id: '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm1',
  memoryMB: 4096,
  name: 'vm1',
  object: {
    networkInterfaces: [
      {
        id: '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Network/networkInterfaces/nic1',
      },
      {
        id: '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Network/networkInterfaces/nic2',
      },
    ],
    properties: {
      hardwareProfile: { vmSize: 'Standard_D2s_v3' },
      storageProfile: { osDisk: { osType: 'linux' } },
    },
  },
  powerState: 'running',
  providerType: 'azure',
  ...overrides,
});

describe('azureVM utils', () => {
  it('detects azure VMs', () => {
    expect(isAzureVm({ providerType: 'azure' })).toBe(true);
    expect(isAzureVm({ providerType: 'ec2' })).toBe(false);
    expect(isAzureVm(undefined)).toBe(false);
  });

  it('reads the VM from provider data', () => {
    const vm = buildVm();

    expect(getAzureVM({ vm })).toBe(vm);
    expect(getAzureVM({})).toBeUndefined();
  });

  it.each([
    ['running', 'on'],
    ['deallocated', 'off'],
    ['stopped', 'off'],
    ['starting', 'unknown'],
    ['', 'unknown'],
  ])('maps power state %s to %s', (powerState, expected) => {
    expect(getAzureVmPowerState(buildVm({ powerState }))).toBe(expected);
  });

  it('returns NIC ARM ids and readable NIC labels', () => {
    const vm = buildVm();

    expect(getAzureNicIds(vm)).toEqual([
      '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Network/networkInterfaces/nic1',
      '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Network/networkInterfaces/nic2',
    ]);
    expect(getAzureNicLabel(getAzureNicIds(vm)[0] ?? '')).toBe('nic1');
    expect(getAzureNicLabel('nic-without-slashes')).toBe('nic-without-slashes');
  });

  it('prefers managed disk types and falls back to VM disks', () => {
    const withManagedDisks = buildVm({
      object: {
        managedDisks: [{ sku: 'Premium_LRS' }, { sku: 'Standard_LRS' }],
      },
    });
    const withDisks = buildVm({ disks: [{ sku: 'StandardSSD_LRS' }] });

    expect(getAzureDiskTypes(withManagedDisks)).toEqual(['Premium_LRS', 'Standard_LRS']);
    expect(getAzureDiskTypes(withDisks)).toEqual(['StandardSSD_LRS']);
    expect(getAzureDiskTypes(undefined)).toEqual([]);
  });
});
