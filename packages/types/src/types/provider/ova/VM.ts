import { Concern } from '../base/model';

import { OvaNetwork } from './Network';
import { OvaResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ova/vm.go
export interface OvaVM extends OvaResource {
  OvaPath: string;
  RevisionValidated: number;
  PolicyVersion: number;
  UUID: string;
  Firmware: string;
  CpuAffinity: number[];
  CpuHotAddEnabled: boolean;
  CpuHotRemoveEnabled: boolean;
  MemoryHotAddEnabled: boolean;
  FaultToleranceEnabled: boolean;
  CpuCount: number;
  CoresPerSocket: number;
  MemoryMB: number;
  BalloonedMemory: number;
  IpAddress: string;
  NumaNodeAffinity: string[];
  StorageUsed: number;
  ChangeTrackingEnabled: boolean;
  Devices: OvaDevice[];
  NICs: OvaNic[];
  Disks: OvaDisk[];
  Networks: OvaNetwork[];
  concerns: Concern[];
}

export interface OvaDevice {
  kind: string;
}

export interface OvaNicConf {
  key: string;
  value: string;
}

export interface OvaNic {
  name: string;
  mac: string;
  Config: OvaNicConf[];
}

export interface OvaDisk {
  Capacity: string;
  CapacityAllocationUnits: string;
  DiskId: string;
  FileRef: string;
  Format: string;
  PopulatedSize: string;
}
