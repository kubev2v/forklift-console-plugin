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
  Url = 'openshiftUrl',
  ServiceAccountToken = 'serviceAccountToken',
}

enum OpenstackProviderFormFieldId {
  Url = 'openstackUrl',
  AuthType = 'openstackAuthType',
  Username = 'openstackUsername',
  Password = 'openstackPassword',
  Token = 'openstackToken',
  RegionName = 'openstackRegionName',
  ProjectName = 'openstackProjectName',
  DomainName = 'openstackDomainName',
  UserId = 'openstackUserId',
  ProjectId = 'openstackProjectId',
  ApplicationCredentialName = 'openstackApplicationCredentialName',
  ApplicationCredentialSecret = 'openstackApplicationCredentialSecret',
  ApplicationCredentialId = 'openstackApplicationCredentialId',
}

enum OvaProviderFormFieldId {
  NfsDirectory = 'nfsDirectory',
}

export const ProviderFormFieldId = {
  ...CommonProviderFormFieldId,
  ...CertificateFormFieldId,
  NfsDirectory: OvaProviderFormFieldId.NfsDirectory,
  OpenshiftUrl: OpenshiftProviderFormFieldId.Url,
  OpenstackApplicationCredentialId: OpenstackProviderFormFieldId.ApplicationCredentialId,
  OpenstackApplicationCredentialName: OpenstackProviderFormFieldId.ApplicationCredentialName,
  OpenstackApplicationCredentialSecret: OpenstackProviderFormFieldId.ApplicationCredentialSecret,
  OpenstackAuthType: OpenstackProviderFormFieldId.AuthType,
  OpenstackDomainName: OpenstackProviderFormFieldId.DomainName,
  OpenstackPassword: OpenstackProviderFormFieldId.Password,
  OpenstackProjectId: OpenstackProviderFormFieldId.ProjectId,
  OpenstackProjectName: OpenstackProviderFormFieldId.ProjectName,
  OpenstackRegionName: OpenstackProviderFormFieldId.RegionName,
  OpenstackToken: OpenstackProviderFormFieldId.Token,
  OpenstackUrl: OpenstackProviderFormFieldId.Url,
  OpenstackUserId: OpenstackProviderFormFieldId.UserId,
  OpenstackUsername: OpenstackProviderFormFieldId.Username,
  ServiceAccountToken: OpenshiftProviderFormFieldId.ServiceAccountToken,
} as const;

export type ProviderFormFieldIdType =
  | CommonProviderFormFieldId
  | CertificateFormFieldId
  | OpenshiftProviderFormFieldId
  | OpenstackProviderFormFieldId
  | OvaProviderFormFieldId;

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
