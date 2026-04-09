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
  OvaApplianceManagement = 'ovaApplianceManagement',
}

enum OvirtProviderFormFieldId {
  OvirtPassword = 'ovirtPassword',
  OvirtUrl = 'ovirtUrl',
  OvirtUsername = 'ovirtUsername',
}

enum VsphereProviderFormFieldId {
  VsphereEndpointType = 'vsphereEndpointType',
  VsphereUrl = 'vsphereUrl',
  VsphereUsername = 'vsphereUsername',
  VspherePassword = 'vspherePassword',
  VsphereVddkInitImage = 'vsphereVddkInitImage',
  VsphereVddkSetupMode = 'vsphereVddkSetupMode',
  VsphereSkipVddk = 'vsphereSkipVddk',
  VsphereUseVddkAioOptimization = 'vsphereUseVddkAioOptimization',
}

enum HypervProviderFormFieldId {
  HypervHost = 'hypervHost',
  HypervUsername = 'hypervUsername',
  HypervPassword = 'hypervPassword',
  SmbUrl = 'smbUrl',
  UseDifferentSmbCredentials = 'useDifferentSmbCredentials',
  SmbUser = 'smbUser',
  SmbPassword = 'smbPassword',
}

enum Ec2ProviderFormFieldId {
  Ec2AccessKeyId = 'ec2AccessKeyId',
  Ec2AutoTargetCredentials = 'ec2AutoTargetCredentials',
  Ec2Region = 'ec2Region',
  Ec2SecretAccessKey = 'ec2SecretAccessKey',
  Ec2TargetAccessKeyId = 'ec2TargetAccessKeyId',
  Ec2TargetAz = 'ec2TargetAz',
  Ec2TargetRegion = 'ec2TargetRegion',
  Ec2TargetSecretAccessKey = 'ec2TargetSecretAccessKey',
  Ec2UseCrossAccountCredentials = 'ec2UseCrossAccountCredentials',
}

export const ProviderFormFieldId = {
  ...CommonProviderFormFieldId,
  ...CertificateFormFieldId,
  ...Ec2ProviderFormFieldId,
  ...OvaProviderFormFieldId,
  ...OpenshiftProviderFormFieldId,
  ...OpenstackProviderFormFieldId,
  ...OvirtProviderFormFieldId,
  ...VsphereProviderFormFieldId,
  ...HypervProviderFormFieldId,
} as const;

export type ProviderFormFieldIdType =
  | CommonProviderFormFieldId
  | CertificateFormFieldId
  | Ec2ProviderFormFieldId
  | OpenshiftProviderFormFieldId
  | OpenstackProviderFormFieldId
  | OvaProviderFormFieldId
  | OvirtProviderFormFieldId
  | VsphereProviderFormFieldId
  | HypervProviderFormFieldId;

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
