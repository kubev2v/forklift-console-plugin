import { t } from '@utils/i18n';

export enum CertificateValidationMode {
  Configure = 'configure',
  Skip = 'skip',
}

enum CommonProviderFormFieldId {
  ProviderName = 'providerName',
  ProviderProject = 'providerProject',
  ProviderType = 'providerType',
  ShowDefaultProjects = 'showDefaultProjects',
}

enum CertificateFormFieldId {
  CertificateValidation = 'certificateValidation',
  CaCertificate = 'caCertificate',
}

enum OpenshiftProviderFormFieldId {
  OpenshiftUrl = 'openshiftUrl',
  ServiceAccountToken = 'serviceAccountToken',
}

enum OpenstackProviderFormFieldId {
  OpenstackApplicationCredentialId = 'openstackApplicationCredentialId',
  OpenstackApplicationCredentialName = 'openstackApplicationCredentialName',
  OpenstackApplicationCredentialSecret = 'openstackApplicationCredentialSecret',
  OpenstackAuthType = 'openstackAuthType',
  OpenstackDomainName = 'openstackDomainName',
  OpenstackPassword = 'openstackPassword',
  OpenstackProjectId = 'openstackProjectId',
  OpenstackProjectName = 'openstackProjectName',
  OpenstackRegionName = 'openstackRegionName',
  OpenstackToken = 'openstackToken',
  OpenstackUrl = 'openstackUrl',
  OpenstackUserId = 'openstackUserId',
  OpenstackUsername = 'openstackUsername',
}

enum OvaProviderFormFieldId {
  NfsDirectory = 'nfsDirectory',
}

enum OvirtProviderFormFieldId {
  OvirtPassword = 'ovirtPassword',
  OvirtUrl = 'ovirtUrl',
  OvirtUsername = 'ovirtUsername',
}

export const ProviderFormFieldId = {
  ...CommonProviderFormFieldId,
  ...CertificateFormFieldId,
  ...OvaProviderFormFieldId,
  ...OpenshiftProviderFormFieldId,
  ...OpenstackProviderFormFieldId,
  ...OvirtProviderFormFieldId,
} as const;

export type ProviderFormFieldIdType =
  | CommonProviderFormFieldId
  | CertificateFormFieldId
  | OpenshiftProviderFormFieldId
  | OpenstackProviderFormFieldId
  | OvaProviderFormFieldId
  | OvirtProviderFormFieldId;

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
