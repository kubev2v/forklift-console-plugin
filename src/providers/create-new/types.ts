import type { FieldValues } from 'react-hook-form';

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

export type OpenshiftFormData = BaseFormData & OpenshiftFields;
export type OvaFormData = BaseFormData & OvaFields;

export type CreateProviderFormData = FieldValues & BaseFormData & OpenshiftFields & OvaFields;

export type CreateProviderFormContextProps = {
  providerNames: string[] | undefined;
  providerNamesLoaded: boolean;
};
