import type { NetworkMappingValue } from 'src/networkMaps/types';

import { t } from '@utils/i18n';

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
  [NetworkMapFieldId.SourceNetwork]: NetworkMappingValue;
  [NetworkMapFieldId.TargetNetwork]: NetworkMappingValue;
};

export const defaultNetworkMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: '' },
  [NetworkMapFieldId.TargetNetwork]: { name: '' },
};

export const networkMapFieldLabels: Partial<Record<NetworkMapFieldId, ReturnType<typeof t>>> = {
  [NetworkMapFieldId.MapName]: t('Map name'),
  [NetworkMapFieldId.Project]: t('Project'),
  [NetworkMapFieldId.SourceNetwork]: t('Source network'),
  [NetworkMapFieldId.SourceProvider]: t('Source provider'),
  [NetworkMapFieldId.TargetNetwork]: t('Target network'),
  [NetworkMapFieldId.TargetProvider]: t('Target provider'),
};
