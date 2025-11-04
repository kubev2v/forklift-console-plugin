import type { OvaDisk, OvaNetwork, OvaVM } from '@kubev2v/types';

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
