import { ISourceNetwork, IOpenShiftNetwork } from './networks.types';
import { ISourceStorage } from './storages.types';
import { IAnnotatedStorageClass } from './storages.types';
import {
  IdOrNameRef,
  IMetaObjectGenerateName,
  IMetaObjectMeta,
  IMetaTypeMeta,
} from './common.types';
import { ISrcDestRefs } from './providers.types';

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}

export interface INetworkMappingItem {
  source: IdOrNameRef;
  destination:
    | {
        name: string;
        namespace: string;
        type: 'multus';
      }
    | { type: 'pod' };
}

export interface IStorageMappingItem {
  source: IdOrNameRef;
  destination: {
    storageClass: string;
  };
}

export type MappingItem = INetworkMappingItem | IStorageMappingItem;

export type CommonMappingCondition =
  | 'Ready'
  | 'SourceProviderNotValid'
  | 'DestinationProviderNotValid';
export type NetworkMappingCondition =
  | CommonMappingCondition
  | 'SourceNetworkNotValid'
  | 'DestinationNetworkNotValid';
export type StorageMappingCondition =
  | CommonMappingCondition
  | 'SourceDatastoreNotValid'
  | 'DestinationDatastoreNotValid';
export type MappingCondition = NetworkMappingCondition | StorageMappingCondition;

export interface ICommonMappingSpec {
  provider: ISrcDestRefs;
}

export interface INetworkMappingSpec extends ICommonMappingSpec {
  map: INetworkMappingItem[];
}

export interface IStorageMappingSpec extends ICommonMappingSpec {
  map: IStorageMappingItem[];
}

interface IMappingAnnotations {
  annotations?: {
    'forklift.konveyor.io/shared'?: 'true' | 'false';
  };
}

interface IMetaObjectGenerateNameWithMappingAnnotations
  extends Omit<IMetaObjectGenerateName, 'annotations'>,
    IMappingAnnotations {}

interface IMetaObjectMetaWithMappingAnnotations
  extends Omit<IMetaObjectMeta, 'annotations'>,
    IMappingAnnotations {}

export type ICommonMappingMetadata =
  | IMetaObjectGenerateNameWithMappingAnnotations
  | IMetaObjectMetaWithMappingAnnotations;

export interface ICommonMapping extends IMetaTypeMeta {
  apiVersion: string;
  kind: 'NetworkMap' | 'StorageMap';
  spec: ICommonMappingSpec;
  metadata: ICommonMappingMetadata;
}

export interface INetworkMapping extends ICommonMapping {
  spec: INetworkMappingSpec;
  status?: {
    conditions: NetworkMappingCondition[];
  };
}

export interface IStorageMapping extends ICommonMapping {
  spec: IStorageMappingSpec;
  status?: {
    conditions: StorageMappingCondition[];
  };
}

export type Mapping = INetworkMapping | IStorageMapping;

// An extra network object to represent the default pod network, which is not included in the inventory
export const POD_NETWORK: IOpenShiftNetwork = {
  name: 'Pod network',
  namespace: 'pod',
  type: 'pod',
  selfLink: 'pod',
  uid: 'pod',
};
export type MappingSource = ISourceStorage | ISourceNetwork;
export type MappingTarget = IOpenShiftNetwork | IAnnotatedStorageClass;
