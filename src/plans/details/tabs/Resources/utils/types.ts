import type { OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';

import type { K8S_UNIT_MULTIPLIERS } from './constants';

export type VMResources = {
  cpuCount: number;
  memoryMB: number;
};

export type PlanResourcesTableProps = {
  planInventorySize: number;
  planInventoryRunningSize: number;
  totalResources: VMResources;
  totalResourcesRunning: VMResources;
};

export type EnhancedVSphereVM = VSphereVM & VMResources;
export type EnhancedOVirtVM = OVirtVM & {
  cpuCores: number;
  memory: number;
};
export type EnhancedOvaVM = OvaVM & { powerState: string };

export type K8sUnit = keyof typeof K8S_UNIT_MULTIPLIERS;
