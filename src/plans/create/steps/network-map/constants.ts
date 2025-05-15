import { t } from '@utils/i18n';

import type { MappingValue } from '../../types';

export enum NetworkMapFieldId {
  NetworkMap = 'networkMap',
  SourceNetwork = 'sourceNetwork',
  TargetNetwork = 'targetNetwork',
}

export const netMapFieldLabels: Partial<Record<NetworkMapFieldId, ReturnType<typeof t>>> = {
  [NetworkMapFieldId.SourceNetwork]: t('Source network'),
  [NetworkMapFieldId.TargetNetwork]: t('Target network'),
};

export type NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: MappingValue;
  [NetworkMapFieldId.TargetNetwork]: MappingValue;
};

export const defaultNetMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: '' },
  [NetworkMapFieldId.TargetNetwork]: { name: t('Pod network') },
};
