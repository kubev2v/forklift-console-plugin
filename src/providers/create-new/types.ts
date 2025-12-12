import type { FieldValues } from 'react-hook-form';
import type { OpenstackAuthType } from 'src/providers/utils/constants';

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

export type OpenshiftFormData = BaseFormData & OpenshiftFields;
export type OvaFormData = BaseFormData & OvaFields;
export type OpenstackFormData = BaseFormData & OpenstackFields;
export type OvirtFormData = BaseFormData & OvirtFields;

export type CreateProviderFormData = FieldValues &
  BaseFormData &
  OpenshiftFields &
  OvaFields &
  OpenstackFields &
  OvirtFields;

export type CreateProviderFormContextProps = {
  providerNames: string[] | undefined;
  providerNamesLoaded: boolean;
};
