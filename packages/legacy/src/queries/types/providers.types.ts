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
    phase: 'ValidationFailed' | 'ConnectionFailed' | 'Ready' | 'Staging' | 'Unknown';
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
  storageClassCount: number; // TODO need to remove when refactoring since there is no such counter for VMware
}

export interface IRHVProvider extends ICommonProvider {
  datacenterCount: number;
  clusterCount: number;
  hostCount: number;
  vmCount: number;
  networkCount: number;
  storageDomainCount: number;

  datastoreCount: number;
  storageClassCount: number; // TODO need to remove when refactoring since there is no such counter for RHV
}

export interface IOvaProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
  DiskCount: number;

  clusterCount: number; // TODO need to remove when refactoring since there is no such counter for openStack
  hostCount: number; // TODO need to remove when refactoring since there is no such counter for openStack
  datastoreCount: number;
  storageClassCount: number; //// TODO need to remove when refactoring since there is no such counter for OVA
}

export interface IOpenStackProvider extends ICommonProvider {
  regionCount: number;
  projectCount: number;
  vmCount: number;
  imageCount: number;
  volumeCount: number;
  volumeTypeCount: number;
  networkCount: number;

  clusterCount: number; // TODO need to remove when refactoring since there is no such counter for openStack
  hostCount: number; // TODO need to remove when refactoring since there is no such counter for openStack
  datastoreCount: number;
  storageClassCount: number; // TODO need to remove when refactoring since there is no such counter for openStack
}

export interface IOpenShiftProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
  storageClassCount: number;

  clusterCount: number; // TODO need to remove when refactoring since there is no such counter for OpenShift
  hostCount: number; // TODO need to remove when refactoring since there is no such counter for OpenShift
  datastoreCount: number;
}

export type InventoryProvider =
  | IVMwareProvider
  | IRHVProvider
  | IOpenStackProvider
  | IOpenShiftProvider
  | IOvaProvider;

export type SourceInventoryProvider =
  | IVMwareProvider
  | IRHVProvider
  | IOpenStackProvider
  | IOpenShiftProvider
  | IOvaProvider;

export interface IProvidersByType {
  vsphere: IVMwareProvider[];
  ovirt: IRHVProvider[];
  openstack: IOpenStackProvider[];
  openshift: IOpenShiftProvider[];
  ova: IOvaProvider[];
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
