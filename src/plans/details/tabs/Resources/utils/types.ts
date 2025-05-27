import type { OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';

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
