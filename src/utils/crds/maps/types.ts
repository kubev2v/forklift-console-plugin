import type { V1beta1NetworkMap, V1beta1NetworkMapSpecMap } from '@forklift-ui/types';
import type { MappingValue, PermissionStatus } from '@utils/types';

export type NetworkMapData = {
  obj?: V1beta1NetworkMap;
  permissions?: PermissionStatus;
};

export enum NetworkMapFieldId {
  MapName = 'mapName',
  Project = 'project',
  NetworkMap = 'networkMap',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  SourceNetwork = 'sourceNetwork',
  TargetNetwork = 'targetNetwork',
}

export type NetworkIPMode = NonNullable<V1beta1NetworkMapSpecMap['networkIPMode']>;

export type NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: MappingValue;
  [NetworkMapFieldId.TargetNetwork]: MappingValue;
  networkIPMode?: NetworkIPMode;
};
