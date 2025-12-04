import { t } from '@utils/i18n';

export enum CertificateValidationMode {
  Configure = 'configure',
  Skip = 'skip',
}

export enum ProviderFormFieldId {
  CaCertificate = 'caCertificate',
  CertificateValidation = 'certificateValidation',
  NfsDirectory = 'nfsDirectory',
  OpenshiftUrl = 'openshiftUrl',
  ProviderName = 'providerName',
  ProviderProject = 'providerProject',
  ProviderType = 'providerType',
  ServiceAccountToken = 'serviceAccountToken',
  ShowDefaultProjects = 'showDefaultProjects',
}

export const providerFormFieldLabels = {
  [ProviderFormFieldId.CaCertificate]: t('CA certificate'),
  [ProviderFormFieldId.CertificateValidation]: t('Certificate validation'),
  [ProviderFormFieldId.NfsDirectory]: t('NFS shared directory'),
  [ProviderFormFieldId.OpenshiftUrl]: t('API endpoint URL'),
  [ProviderFormFieldId.ProviderName]: t('Name'),
  [ProviderFormFieldId.ProviderProject]: t('Provider project'),
  [ProviderFormFieldId.ProviderType]: t('Provider type'),
  [ProviderFormFieldId.ServiceAccountToken]: t('Service account bearer token'),
  [ProviderFormFieldId.ShowDefaultProjects]: t('Show default projects'),
};
