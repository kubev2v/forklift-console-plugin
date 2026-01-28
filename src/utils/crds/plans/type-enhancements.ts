import type { HypervVM, OvaDisk, OvaNetwork, OvaVM } from '@forklift-ui/types';

type OvaID = {
  ID: string;
};

type EnhancedOvaDisk = OvaDisk & OvaID;

type EnhancedOvaNetwork = OvaNetwork & OvaID;

export type EnhancedOvaVM = OvaVM & {
  powerState: string;
  disks: EnhancedOvaDisk[];
  networks: EnhancedOvaNetwork[];
  memoryMB: number;
  cpuCount: number;
};

export type EnhancedHypervVM = HypervVM & {
  powerState: string;
};
