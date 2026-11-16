// Development-only fixtures that let the Azure UI be reviewed without an Azure
// subscription. Enabled with AZURE_MOCK_INVENTORY=true; never used in production.

import { PROVIDER_TYPES } from '@utils/providers/constants';

const SUBSCRIPTION_ID = '00000000-0000-0000-0000-000000000000';
const RESOURCE_GROUP = 'rg-demo';

const armId = (resourceType: string, name: string): string =>
  `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/${resourceType}/${name}`;

const nicId = (name: string): string => armId('Microsoft.Network/networkInterfaces', name);
const diskId = (name: string): string => armId('Microsoft.Compute/disks', name);
const subnetId = (network: string, subnet: string): string =>
  `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Network/virtualNetworks/${network}/subnets/${subnet}`;

type MockDisk = {
  id: string;
  isOS: boolean;
  name: string;
  sizeGB: number;
  sku: string;
};

const disk = (name: string, sku: string, sizeGB: number, isOS = false): MockDisk => ({
  id: diskId(name),
  isOS,
  name,
  sizeGB,
  sku,
});

const buildVm = ({
  cpuCount,
  disks,
  guestId,
  memoryMB,
  name,
  nicNames,
  osType,
  powerState,
  vmSize,
}: {
  cpuCount: number;
  disks: MockDisk[];
  guestId: string;
  memoryMB: number;
  name: string;
  nicNames: string[];
  osType: string;
  powerState: string;
  vmSize: string;
}): Record<string, unknown> => ({
  cpuCount,
  disks,
  guestId,
  id: armId('Microsoft.Compute/virtualMachines', name),
  memoryMB,
  name,
  object: {
    cpuCount,
    disks,
    guestId,
    managedDisks: disks,
    memoryMB,
    networkInterfaces: nicNames.map((nicName, index) => ({
      id: nicId(nicName),
      name: nicName,
      primary: index === 0,
    })),
    powerState,
    properties: {
      hardwareProfile: { vmSize },
      storageProfile: { osDisk: { osType } },
    },
  },
  powerState,
  providerType: PROVIDER_TYPES.azure,
});

export const AZURE_MOCK_VMS = [
  buildVm({
    cpuCount: 2,
    disks: [
      disk('demo-web-01-os-disk', 'Premium_LRS', 64, true),
      disk('demo-web-01-data-disk', 'Standard_LRS', 128),
    ],
    guestId: 'rhel9_64Guest',
    memoryMB: 8192,
    name: 'demo-web-01',
    nicNames: ['nic-demo-web-01'],
    osType: 'linux',
    powerState: 'running',
    vmSize: 'Standard_D2s_v3',
  }),
  buildVm({
    cpuCount: 4,
    disks: [
      disk('demo-db-01-os-disk', 'Premium_LRS', 128, true),
      disk('demo-db-01-data-disk', 'Premium_LRS', 512),
    ],
    guestId: 'rhel8_64Guest',
    memoryMB: 32768,
    name: 'demo-db-01',
    nicNames: ['nic-demo-db-01'],
    osType: 'linux',
    powerState: 'deallocated',
    vmSize: 'Standard_E4s_v3',
  }),
  buildVm({
    cpuCount: 2,
    disks: [disk('demo-legacy-01-os-disk', 'StandardSSD_LRS', 256, true)],
    guestId: 'windows2022_64Guest',
    memoryMB: 8192,
    name: 'demo-legacy-01',
    nicNames: ['nic-demo-legacy-01', 'nic-demo-legacy-02'],
    osType: 'windows',
    powerState: 'stopped',
    vmSize: 'Standard_B2ms',
  }),
];

export const AZURE_MOCK_NETWORKS = ['subnet-app', 'subnet-data', 'subnet-mgmt'].map((name) => ({
  id: subnetId('network-demo', name),
  name,
  providerType: PROVIDER_TYPES.azure,
  revision: 1,
  selfLink: '',
}));

export const AZURE_MOCK_STORAGES = [
  'Standard_LRS',
  'StandardSSD_LRS',
  'Premium_LRS',
  'Premium_ZRS',
  'UltraSSD_LRS',
].map((name) => ({
  id: name,
  name,
  providerType: PROVIDER_TYPES.azure,
  revision: 1,
  selfLink: '',
}));

export const AZURE_MOCK_PROVIDER_INVENTORY = {
  diskCount: 5,
  networkCount: AZURE_MOCK_NETWORKS.length,
  storageCount: AZURE_MOCK_STORAGES.length,
  type: PROVIDER_TYPES.azure,
  vmCount: AZURE_MOCK_VMS.length,
};
