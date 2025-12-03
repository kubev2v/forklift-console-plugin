import type { ProvidersPermissionStatus } from 'src/modules/Providers/utils/types/ProvidersPermissionStatus';

import type { V1beta1NetworkMap } from '@kubev2v/types';

export type NetworkMapData = {
  obj?: V1beta1NetworkMap;
  permissions?: ProvidersPermissionStatus;
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

export type NetworkMappingValue = { id?: string; name: string };

export type NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: NetworkMappingValue;
  [NetworkMapFieldId.TargetNetwork]: NetworkMappingValue;
};
