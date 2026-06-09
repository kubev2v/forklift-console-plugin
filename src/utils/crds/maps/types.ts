import type { V1beta1NetworkMap } from '@forklift-ui/types';
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

export type NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: MappingValue;
  [NetworkMapFieldId.TargetNetwork]: MappingValue;
};
