import { useContext } from 'react';

import { CreateProviderFormContext } from '../constants';

/**
 * Hook to access the Create Provider data context
 * @returns Context containing provider names for validation
 */
export const useCreateProviderDataContext = () => useContext(CreateProviderFormContext);
