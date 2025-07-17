import { useCallback } from 'react';

import { type PlanWizardStepId, stepFieldMap } from '../constants';

import { useCreatePlanFormContext } from './useCreatePlanFormContext';

/**
 * Validates wizard form steps and checks for step-specific errors.
 */
export const useStepValidation = () => {
  const {
    formState: { errors },
    trigger,
  } = useCreatePlanFormContext();

  const validateStep = useCallback(
    async (stepId: PlanWizardStepId): Promise<boolean> => {
      const fieldIds = stepFieldMap[stepId];
      if (!fieldIds?.length) return true;

      return trigger(fieldIds, { shouldFocus: true });
    },
    [trigger],
  );

  const hasStepErrors = useCallback(
    (stepId: PlanWizardStepId): boolean => {
      const fieldIds = stepFieldMap[stepId];
      return fieldIds?.some((fieldId) => errors[fieldId]) ?? false;
    },
    [errors],
  );

  return {
    hasStepErrors,
    validateStep,
  };
};
