import type { FieldValues } from 'react-hook-form';

import type { ProviderFormFieldId } from './fields/constants';

export type CreateProviderFormData = FieldValues & {
  [ProviderFormFieldId.NfsDirectory]?: string;
  [ProviderFormFieldId.ProviderName]: string;
  [ProviderFormFieldId.ProviderProject]: string;
  [ProviderFormFieldId.ProviderType]: string | undefined;
  [ProviderFormFieldId.ShowDefaultProjects]: boolean;
};

export type CreateProviderFormContextProps = {
  providerNames: string[] | undefined;
  providerNamesLoaded: boolean;
};
