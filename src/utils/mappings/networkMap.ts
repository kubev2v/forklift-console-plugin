import { DEFAULT_NETWORK } from '@utils/constants';
import { t } from '@utils/i18n';
import { IgnoreNetwork } from '@utils/mappings/constants';
import type { MappingValue } from '@utils/types';

export enum NetworkMapFieldId {
  NetworkMap = 'networkMap',
  ExistingNetworkMap = 'existingNetworkMap',
  NetworkMapType = 'networkMapType',
  NetworkMapName = 'networkMapName',
  SourceNetwork = 'sourceNetwork',
  TargetNetwork = 'targetNetwork',
}

export const netMapFieldLabels: Partial<Record<NetworkMapFieldId, ReturnType<typeof t>>> = {
  [NetworkMapFieldId.ExistingNetworkMap]: t('Network map'),
  [NetworkMapFieldId.NetworkMapName]: t('Network map name'),
  [NetworkMapFieldId.SourceNetwork]: t('Source network'),
  [NetworkMapFieldId.TargetNetwork]: t('Target network'),
};

export type NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: MappingValue;
  [NetworkMapFieldId.TargetNetwork]: MappingValue;
};

export const defaultNetMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: '' },
  [NetworkMapFieldId.TargetNetwork]: { name: DEFAULT_NETWORK },
};

export const ignoreNetMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: '' },
  [NetworkMapFieldId.TargetNetwork]: { name: IgnoreNetwork.Label },
};

export enum NetworkMapType {
  New = 'new',
  Existing = 'existing',
}

export const networkMapTypeLabels = {
  [NetworkMapType.Existing]: t('Use an existing network map'),
  [NetworkMapType.New]: t('Use new network map'),
};
