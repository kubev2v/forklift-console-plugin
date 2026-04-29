import { planStepOrder, type PlanWizardStepId } from '../constants';

export const hasPreviousStepErrors = (
  targetStepId: PlanWizardStepId,
  hasStepErrors: (stepId: PlanWizardStepId) => boolean,
  skippedStepIds?: Set<PlanWizardStepId>,
): boolean => {
  const targetStepOrder = planStepOrder[targetStepId];

  return Object.entries(planStepOrder).some(
    ([stepId, stepOrder]) =>
      stepOrder < targetStepOrder &&
      !skippedStepIds?.has(stepId as PlanWizardStepId) &&
      hasStepErrors(stepId as PlanWizardStepId),
  );
};
