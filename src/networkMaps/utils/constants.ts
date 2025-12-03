import { t } from '@utils/i18n';

import { NetworkMapFieldId, type NetworkMapping } from './types';

export const defaultNetworkMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: { name: '' },
  [NetworkMapFieldId.TargetNetwork]: { name: '' },
};

export const networkMapFieldLabels: Partial<Record<NetworkMapFieldId, ReturnType<typeof t>>> = {
  [NetworkMapFieldId.MapName]: t('Network map name'),
  [NetworkMapFieldId.Project]: t('Project'),
  [NetworkMapFieldId.SourceNetwork]: t('Source network'),
  [NetworkMapFieldId.SourceProvider]: t('Source provider'),
  [NetworkMapFieldId.TargetNetwork]: t('Target network'),
  [NetworkMapFieldId.TargetProvider]: t('Target provider'),
};
