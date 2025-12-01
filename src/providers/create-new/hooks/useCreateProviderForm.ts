import type { UseFormProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import type { CreateProviderFormData } from '../types';

/**
 * Typed wrapper around useForm for Create Provider form
 */
export const useCreateProviderForm = (props: UseFormProps<CreateProviderFormData>) =>
  useForm<CreateProviderFormData>(props);
