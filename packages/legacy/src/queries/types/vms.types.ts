import { IVMwareObjRef } from './common.types';

export interface ISourceVMConcern {
  label: string;
  category: 'Warning' | 'Critical' | 'Information' | 'Advisory';
  assessment: string;
}

interface IBaseSourceVM {
  id: string;
  revision: number;
  name: string;
  selfLink: string;
  concerns: ISourceVMConcern[];
  revisionValidated: number;
}

export interface IVMwareVMDisk {
  datastore: IVMwareObjRef;
}

export interface IVMwareVM extends IBaseSourceVM {
  networks: IVMwareObjRef[];
  disks: IVMwareVMDisk[];
  isTemplate: boolean;
  powerState?: 'poweredOff' | 'poweredOn';
}

export interface IRHVNIC {
  profile: string;
  name: string;
  id: string;
}

export interface IRHVDiskAttachment {
  disk: string;
  id: string;
}

export interface IRHVVM extends IBaseSourceVM {
  nics: IRHVNIC[];
  diskAttachments: IRHVDiskAttachment[];
  status?: 'up' | 'down';
}

export type SourceVM = IVMwareVM | IRHVVM;
