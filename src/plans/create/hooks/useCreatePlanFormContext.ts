import { useFormContext, type UseFormReturn } from 'react-hook-form';

import type { CreatePlanFormData } from '../types';

/**
 * Custom wrapper around react-hook-form's useFormContext hook
 * Provides typed access to form context for the migration plan creation form
 */
export const useCreatePlanFormContext = (): UseFormReturn<CreatePlanFormData> =>
  useFormContext<CreatePlanFormData>();
