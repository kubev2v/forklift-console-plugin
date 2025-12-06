import type { FieldValues } from 'react-hook-form';

import type { CertificateValidationMode, ProviderFormFieldId } from './fields/constants';

export type CreateProviderFormData = FieldValues & {
  [ProviderFormFieldId.CaCertificate]?: string;
  [ProviderFormFieldId.CertificateValidation]?: CertificateValidationMode;
  [ProviderFormFieldId.NfsDirectory]?: string;
  [ProviderFormFieldId.OpenshiftUrl]?: string;
  [ProviderFormFieldId.ProviderName]: string;
  [ProviderFormFieldId.ProviderProject]: string;
  [ProviderFormFieldId.ProviderType]: string | undefined;
  [ProviderFormFieldId.ServiceAccountToken]?: string;
  [ProviderFormFieldId.ShowDefaultProjects]: boolean;
};

export type CreateProviderFormContextProps = {
  providerNames: string[] | undefined;
  providerNamesLoaded: boolean;
};
