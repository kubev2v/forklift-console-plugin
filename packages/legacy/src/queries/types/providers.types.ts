import { ProviderType } from 'legacy/src/common/constants';
import {
  ICR,
  IMetaObjectMeta,
  INameNamespaceRef,
  IStatusCondition,
  IObjectReference,
} from 'legacy/src/queries/types';

interface IProviderMetadata extends IMetaObjectMeta {
  annotations?: {
    'forklift.konveyor.io/defaultTransferNetwork'?: string;
    [key: string]: string | undefined;
  };
}

export interface IProviderObject extends ICR {
  metadata: IProviderMetadata;
  spec: {
    type: ProviderType | null;
    url?: string; // No url = host provider
    secret?: INameNamespaceRef;
    settings?: {
      vddkInitImage?: string; // VMware only
    };
  };
  status?: {
    conditions: IStatusCondition[];
  };
}

export interface ICommonProvider {
  uid: string;
  namespace: string;
  name: string;
  selfLink: string;
  type: ProviderType;
  object: IProviderObject;
}

export interface IVMwareProvider extends ICommonProvider {
  clusterCount: number;
  hostCount: number;
  vmCount: number;
  networkCount: number;
  datastoreCount: number;
}

export interface IRHVProvider extends ICommonProvider {
  datacenterCount: number;
  clusterCount: number;
  hostCount: number;
  vmCount: number;
  networkCount: number;
  storageDomainCount: number;
}

export interface IOpenShiftProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
}

export type InventoryProvider = IVMwareProvider | IRHVProvider | IOpenShiftProvider;
export type SourceInventoryProvider = IVMwareProvider | IRHVProvider;

export interface IProvidersByType {
  vsphere: IVMwareProvider[];
  ovirt: IRHVProvider[];
  openshift: IOpenShiftProvider[];
}

export interface ICorrelatedProvider<T extends InventoryProvider> extends IProviderObject {
  inventory: T | null;
}

export interface ISrcDestRefs {
  source: IObjectReference;
  destination: IObjectReference;
}

export interface IByProvider<T> {
  [providerName: string]: T[];
}
