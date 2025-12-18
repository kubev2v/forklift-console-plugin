import { useFormContext } from 'react-hook-form';

import type { CreateProviderFormData } from '../types';

/**
 * Custom wrapper around react-hook-form's useFormContext hook
 * Provides typed access to form context for the provider creation form
 */
export const useCreateProviderFormContext = () => useFormContext<CreateProviderFormData>();
