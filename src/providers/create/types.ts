import type { FieldValues } from 'react-hook-form';
import type {
  OpenstackAuthType,
  VddkSetupMode,
  VSphereEndpointType,
} from 'src/providers/utils/constants';

import type { CertificateValidationMode, ProviderFormFieldId } from './fields/constants';

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
  [ProviderFormFieldId.HypervUsername]?: string;
  [ProviderFormFieldId.HypervPassword]?: string;
  [ProviderFormFieldId.SmbUrl]?: string;
  [ProviderFormFieldId.UseDifferentSmbCredentials]?: boolean;
  [ProviderFormFieldId.SmbUser]?: string;
  [ProviderFormFieldId.SmbPassword]?: string;
};

type OpenstackFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.OpenstackUrl]?: string;
  [ProviderFormFieldId.OpenstackAuthType]?: OpenstackAuthType;
  [ProviderFormFieldId.OpenstackUsername]?: string;
  [ProviderFormFieldId.OpenstackPassword]?: string;
  [ProviderFormFieldId.OpenstackToken]?: string;
  [ProviderFormFieldId.OpenstackRegionName]?: string;
  [ProviderFormFieldId.OpenstackProjectName]?: string;
  [ProviderFormFieldId.OpenstackDomainName]?: string;
  [ProviderFormFieldId.OpenstackUserId]?: string;
  [ProviderFormFieldId.OpenstackProjectId]?: string;
  [ProviderFormFieldId.OpenstackApplicationCredentialName]?: string;
  [ProviderFormFieldId.OpenstackApplicationCredentialSecret]?: string;
  [ProviderFormFieldId.OpenstackApplicationCredentialId]?: string;
};

type OvirtFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.OvirtUrl]?: string;
  [ProviderFormFieldId.OvirtUsername]?: string;
  [ProviderFormFieldId.OvirtPassword]?: string;
};

type VsphereFields = {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.VsphereEndpointType]?: VSphereEndpointType;
  [ProviderFormFieldId.VsphereUrl]?: string;
  [ProviderFormFieldId.VsphereUsername]?: string;
  [ProviderFormFieldId.VspherePassword]?: string;
  [ProviderFormFieldId.VsphereVddkInitImage]?: string;
  [ProviderFormFieldId.VsphereVddkSetupMode]?: VddkSetupMode;
  [ProviderFormFieldId.VsphereSkipVddk]?: boolean;
  [ProviderFormFieldId.VsphereUseVddkAioOptimization]?: boolean;
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
export type OpenshiftFormData = BaseFormData & OpenshiftFields;
export type OvaFormData = BaseFormData & OvaFields;
export type OpenstackFormData = BaseFormData & OpenstackFields;
export type OvirtFormData = BaseFormData & OvirtFields;
export type VsphereFormData = BaseFormData & VsphereFields;
export type HypervFormData = BaseFormData & HypervFields;

export type CreateProviderFormData = FieldValues &
  BaseFormData &
  Ec2Fields &
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
