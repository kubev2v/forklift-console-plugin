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
  PasswordSecretFields = 'passwordSecretFields',
  TokenWithUsernameSecretFields = 'tokenWithUsernameSecretFields',
  TokenWithUserIDSecretFields = 'tokenWithUserIDSecretFields',
  ApplicationCredentialIdSecretFields = 'applicationCredentialIdSecretFields',
  ApplicationCredentialNameSecretFields = 'applicationCredentialNameSecretFields',
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

export enum OpenstackAuthTypeLabels {
  ApplicationCredentialId = 'Application credential ID',
  ApplicationCredentialName = 'Application credential name',
  TokenWithUserID = 'Token with user ID',
  TokenWithUsername = 'Token with user name',
  Password = 'Password',
}

export enum ProviderFieldsId {
  Name = 'k8sName',
  Url = 'url',
  SdkEndpoint = 'sdkEndpoint',
  VddkInitImage = 'vddkInitImage',
  EmptyVddkInitImage = 'emptyVddkInitImage',
  Project = 'project',
  UseVddkAioOptimization = 'useVddkAioOptimization',
}

export enum SecretFieldsId {
  User = 'user',
  Password = 'password',
  CaCert = 'cacert',
  InsecureSkipVerify = 'insecureSkipVerify',
  Token = 'token',
}
