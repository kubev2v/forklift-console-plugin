import { ICR, INameNamespaceRef, IStatusCondition } from './common.types';

export interface IHostNetworkAdapter {
  name: string;
  ipAddress: string;
  subnetMask: string;
  linkSpeed: number;
  mtu: number;
}

export interface IHost {
  id: string;
  name: string;
  selfLink: string;
  managementServerIp: string;
  networkAdapters: IHostNetworkAdapter[];
}

export interface IHostConfig extends ICR {
  apiVersion: string;
  kind: 'Host';
  spec: {
    id: string;
    ipAddress: string;
    provider: INameNamespaceRef;
    secret?: INameNamespaceRef | null;
    thumbprint?: string;
  };
  status?: {
    conditions: IStatusCondition[];
  };
}
