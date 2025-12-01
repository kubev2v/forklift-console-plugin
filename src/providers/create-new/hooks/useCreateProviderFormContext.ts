import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateProviderFormContext } from '../constants';
import type { CreateProviderFormData } from '../types';

/**
 * Typed wrapper around useFormContext for Create Provider form
 * Provides type safety when accessing form context in components
 */
export const useCreateProviderFormContext = () => useFormContext<CreateProviderFormData>();

/**
 * Hook to access the Create Provider form data fetching context
 * Provides centralized data like provider names for validation
 */
export const useCreateProviderDataContext = () => useContext(CreateProviderFormContext);
