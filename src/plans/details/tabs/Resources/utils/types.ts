import type { OVirtVM, VSphereVM } from '@forklift-ui/types';

export type VMResources = {
  cpuCount: number;
  memoryMB: number;
};

export type PlanResourcesTableProps = {
  planInventoryRunningSize: number;
  planInventorySize: number;
  totalResources: VMResources;
  totalResourcesRunning: VMResources;
};

export type EnhancedVSphereVM = VSphereVM & VMResources;
export type EnhancedOVirtVM = OVirtVM & {
  cpuCores: number;
  memory: number;
};
