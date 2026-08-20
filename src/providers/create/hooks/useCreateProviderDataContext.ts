import { useContext } from 'react';

import { CreateProviderFormContext } from '../constants';
import type { CreateProviderFormContextProps } from '../types';

/**
 * Hook to access the Create Provider data context
 * @returns Context containing provider names for validation
 */
export const useCreateProviderDataContext = (): CreateProviderFormContextProps =>
  useContext(CreateProviderFormContext);
