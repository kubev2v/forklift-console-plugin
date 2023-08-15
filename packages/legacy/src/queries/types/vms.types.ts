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

export interface IOpenStackVM extends IBaseSourceVM {
  addresses: Record<string, IOpenStackNIC>;
  attachedVolumes: IOpenStackDiskAttachment[];
  status?: 'ACTIVE' | 'SHUTOFF' | 'PAUSED' | 'SHELVED_OFFLOADED' | 'SUSPENDED';
}

export interface IOpenShiftVM extends IBaseSourceVM {
  object?: {
    status?: {
      printableStatus?: string;
    };
    spec?: {
      template?: {
        spec: {
          networks?: IOpenShiftNIC[];
        };
      };
    };
  };
}

export interface IOpenStackNIC {
  'OS-EXT-IPS-MAC:mac_addr'?: string;
  'OS-EXT-IPS:type'?: string;
  addr?: string;
  version?: number;
}

export interface IOpenStackDiskAttachment {
  ID?: string;
}

export interface IOpenShiftNIC {
  pod?: NonNullable<unknown>;
  multus?: {
    networkName: string;
  };
}

export type SourceVM = IVMwareVM | IRHVVM | IOpenStackVM;
