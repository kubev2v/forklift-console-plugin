import type { ProvidersPermissionStatus } from 'src/providers/utils/types/ProvidersPermissionStatus';

import type { V1beta1NetworkMap } from '@kubev2v/types';
import type { MappingValue } from '@utils/types';

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

export type NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: MappingValue;
  [NetworkMapFieldId.TargetNetwork]: MappingValue;
};
