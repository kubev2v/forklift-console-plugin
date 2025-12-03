import { ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData } from '../types';

/**
 * Returns default form values for the Create Provider form
 */
export const getDefaultFormValues = (namespace: string): Partial<CreateProviderFormData> => {
  return {
    [ProviderFormFieldId.ProviderName]: '',
    [ProviderFormFieldId.ProviderProject]: namespace,
    [ProviderFormFieldId.ProviderType]: undefined,
  };
};
