import { t } from '@utils/i18n';

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
  [NetworkMapFieldId.SourceNetwork]: string;
  [NetworkMapFieldId.TargetNetwork]: string;
};

export const defaultNetMapping: NetworkMapping = {
  [NetworkMapFieldId.SourceNetwork]: '',
  [NetworkMapFieldId.TargetNetwork]: t('Pod network'),
};
