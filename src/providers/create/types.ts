import type { FieldValues } from 'react-hook-form';
import type {
  OpenstackAuthType,
  VddkSetupMode,
  VSphereEndpointType,
} from 'src/providers/utils/constants';

import type {
  CertificateValidationMode,
  HypervManagementType,
  HypervTransferMethod,
  NutanixPrismType,
  ProviderFormFieldId,
} from './fields/constants';

type BaseFormData = {
  [ProviderFormFieldId.ProviderName]: string;
  [ProviderFormFieldId.ProviderProject]: string;
  [ProviderFormFieldId.ProviderType]: string | undefined;
  [ProviderFormFieldId.ShowDefaultProjects]: boolean;
};

type OpenshiftFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.OpenshiftUrl]?: string;
  [ProviderFormFieldId.ServiceAccountToken]?: string;
};

type OvaFields = {
  [ProviderFormFieldId.NfsDirectory]?: string;
  [ProviderFormFieldId.OvaApplianceManagement]?: boolean;
};

type HypervFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.HypervHost]?: string;
  [ProviderFormFieldId.HypervPassword]?: string;
  [ProviderFormFieldId.HypervUsername]?: string;
  [ProviderFormFieldId.MgmtType]?: HypervManagementType;
  [ProviderFormFieldId.SmbPassword]?: string;
  [ProviderFormFieldId.SmbUrl]?: string;
  [ProviderFormFieldId.SmbUser]?: string;
  [ProviderFormFieldId.TransferMethod]?: HypervTransferMethod;
  [ProviderFormFieldId.UseDifferentSmbCredentials]?: boolean;
};

type OpenstackFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.OpenstackApplicationCredentialId]?: string;
  [ProviderFormFieldId.OpenstackApplicationCredentialName]?: string;
  [ProviderFormFieldId.OpenstackApplicationCredentialSecret]?: string;
  [ProviderFormFieldId.OpenstackAuthType]?: OpenstackAuthType;
  [ProviderFormFieldId.OpenstackDomainName]?: string;
  [ProviderFormFieldId.OpenstackPassword]?: string;
  [ProviderFormFieldId.OpenstackProjectId]?: string;
  [ProviderFormFieldId.OpenstackProjectName]?: string;
  [ProviderFormFieldId.OpenstackRegionName]?: string;
  [ProviderFormFieldId.OpenstackToken]?: string;
  [ProviderFormFieldId.OpenstackUrl]?: string;
  [ProviderFormFieldId.OpenstackUserId]?: string;
  [ProviderFormFieldId.OpenstackUsername]?: string;
};

type OvirtFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.OvirtPassword]?: string;
  [ProviderFormFieldId.OvirtUrl]?: string;
  [ProviderFormFieldId.OvirtUsername]?: string;
};

type VsphereFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.VsphereEndpointType]?: VSphereEndpointType;
  [ProviderFormFieldId.VspherePassword]?: string;
  [ProviderFormFieldId.VsphereSkipVddk]?: boolean;
  [ProviderFormFieldId.VsphereUrl]?: string;
  [ProviderFormFieldId.VsphereUsername]?: string;
  [ProviderFormFieldId.VsphereUseVddkAioOptimization]?: boolean;
  [ProviderFormFieldId.VsphereVddkInitImage]?: string;
  [ProviderFormFieldId.VsphereVddkSetupMode]?: VddkSetupMode;
};

type NutanixFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.NutanixPassword]?: string;
  [ProviderFormFieldId.NutanixPrismType]?: NutanixPrismType;
  [ProviderFormFieldId.NutanixUrl]?: string;
  [ProviderFormFieldId.NutanixUsername]?: string;
};

type Ec2Fields = {
  [ProviderFormFieldId.Ec2AccessKeyId]?: string;
  [ProviderFormFieldId.Ec2AutoTargetCredentials]?: boolean;
  [ProviderFormFieldId.Ec2Region]?: string;
  [ProviderFormFieldId.Ec2SecretAccessKey]?: string;
  [ProviderFormFieldId.Ec2TargetAccessKeyId]?: string;
  [ProviderFormFieldId.Ec2TargetAz]?: string;
  [ProviderFormFieldId.Ec2TargetRegion]?: string;
  [ProviderFormFieldId.Ec2TargetSecretAccessKey]?: string;
  [ProviderFormFieldId.Ec2UseCrossAccountCredentials]?: boolean;
};

export type Ec2FormData = BaseFormData & Ec2Fields;
export type NutanixFormData = BaseFormData & NutanixFields;
export type OpenshiftFormData = BaseFormData & OpenshiftFields;
export type OvaFormData = BaseFormData & OvaFields;
export type OpenstackFormData = BaseFormData & OpenstackFields;
export type OvirtFormData = BaseFormData & OvirtFields;
export type VsphereFormData = BaseFormData & VsphereFields;
export type HypervFormData = BaseFormData & HypervFields;

export type CreateProviderFormData = FieldValues &
  BaseFormData &
  Ec2Fields &
  NutanixFields &
  OpenshiftFields &
  OvaFields &
  OpenstackFields &
  OvirtFields &
  VsphereFields &
  HypervFields;

export type CreateProviderFormContextProps = {
  providerNames: string[] | undefined;
  providerNamesLoaded: boolean;
};
