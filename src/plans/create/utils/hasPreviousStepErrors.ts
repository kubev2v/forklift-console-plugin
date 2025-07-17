import { planStepOrder, type PlanWizardStepId } from '../constants';

export const hasPreviousStepErrors = (
  targetStepId: PlanWizardStepId,
  hasStepErrors: (stepId: PlanWizardStepId) => boolean,
): boolean => {
  const targetStepOrder = planStepOrder[targetStepId];

  return Object.entries(planStepOrder).some(
    ([stepId, stepOrder]) =>
      stepOrder < targetStepOrder && hasStepErrors(stepId as PlanWizardStepId),
  );
};
