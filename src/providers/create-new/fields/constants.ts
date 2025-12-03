import { t } from '@utils/i18n';

export enum ProviderFormFieldId {
  NfsDirectory = 'nfsDirectory',
  ProviderName = 'providerName',
  ProviderProject = 'providerProject',
  ProviderType = 'providerType',
  ShowDefaultProjects = 'showDefaultProjects',
}

export const providerFormFieldLabels = {
  [ProviderFormFieldId.NfsDirectory]: t('NFS shared directory'),
  [ProviderFormFieldId.ProviderName]: t('Name'),
  [ProviderFormFieldId.ProviderProject]: t('Provider project'),
  [ProviderFormFieldId.ProviderType]: t('Provider type'),
  [ProviderFormFieldId.ShowDefaultProjects]: t('Show default projects'),
};
