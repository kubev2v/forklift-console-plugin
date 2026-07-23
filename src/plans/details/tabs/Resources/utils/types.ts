import type { OVirtVM, ProviderVirtualMachine, VSphereVM } from '@forklift-ui/types';

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

export type NutanixVM = ProviderVirtualMachine & {
  memorySizeMib?: number;
  numSockets?: number;
  numVcpusPerSocket?: number;
  powerState?: string;
};
