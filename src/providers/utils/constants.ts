import { t } from '@utils/i18n';

export const EMPTY_VDDK_INIT_IMAGE_ANNOTATION = 'forklift.konveyor.io/empty-vddk-init-image';

export enum ProvidersResourceFieldId {
  Name = 'name',
  Namespace = 'namespace',
  Phase = 'phase',
  Url = 'url',
  Type = 'type',
  VmCount = 'vmCount',
  NetworkCount = 'networkCount',
  ClusterCount = 'clusterCount',
  HostCount = 'hostCount',
  StorageCount = 'storageCount',
  Actions = 'actions',
  DatacenterCount = 'datacenterCount',
  Product = 'product',
  VolumeTypeCount = 'volumeTypeCount',
  ProjectCount = 'projectCount',
  RegionCount = 'regionCount',
}

export const providerUiAnnotation = 'forklift.konveyor.io/providerUI';

export const PROVIDER_TYPES = {
  openshift: 'openshift',
  openstack: 'openstack',
  ova: 'ova',
  ovirt: 'ovirt',
  vsphere: 'vsphere',
} as const;

export enum VSphereEndpointType {
  ESXi = 'esxi',
  vCenter = 'vcenter',
}

export enum OpenstackAuthType {
  Password = 'password',
  TokenWithUsername = 'tokenWithUsername',
  TokenWithUserId = 'tokenWithUserId',
  ApplicationCredentialId = 'applicationCredentialId',
  ApplicationCredentialName = 'applicationCredentialName',
}

export enum OpenstackSecretFieldsId {
  Username = 'username',
  Password = 'password',
  Token = 'token',
  RegionName = 'regionName',
  ProjectName = 'projectName',
  DomainName = 'domainName',
  UserId = 'userID',
  ProjectId = 'projectID',
  ApplicationCredentialName = 'applicationCredentialName',
  ApplicationCredentialSecret = 'applicationCredentialSecret',
  ApplicationCredentialId = 'applicationCredentialID',
  InsecureSkipVerify = 'insecureSkipVerify',
  CaCert = 'cacert',
  AuthType = 'authType',
}

export const openstackAuthTypeLabels = {
  applicationCredentialId: t('Application credential ID'),
  applicationCredentialName: t('Application credential name'),
  password: t('Password'),
  tokenWithUserID: t('Token with user ID'),
  tokenWithUsername: t('Token with user name'),
} as const;

export enum SecretFieldsId {
  User = 'user',
  Password = 'password',
  CaCert = 'cacert',
  InsecureSkipVerify = 'insecureSkipVerify',
  Token = 'token',
}

export const YES_VALUE = t('yes');
export const TRUE_VALUE = t('true');

export enum VddkSetupMode {
  Upload = 'upload',
  Manual = 'manual',
  Skip = 'skip',
}
