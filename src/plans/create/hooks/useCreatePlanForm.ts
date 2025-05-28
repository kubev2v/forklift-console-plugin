import { useForm, type UseFormProps } from 'react-hook-form';

import type { CreatePlanFormData } from '../types';

/**
 * Custom wrapper around react-hook-form's useForm hook
 * Provides typed form handling for the migration plan creation form
 */
export const useCreatePlanForm = (props: UseFormProps<CreatePlanFormData>) =>
  useForm<CreatePlanFormData>(props);
