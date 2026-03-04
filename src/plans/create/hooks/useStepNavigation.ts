import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { WizardProps, WizardStepType } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';

import { firstStep, planStepOrder, type PlanWizardStepId } from '../constants';

import { useStepValidation } from './useStepValidation';

type UseStepNavigationResult = {
  currentStep: WizardStepType;
  handleStepChange: WizardProps['onStepChange'];
  hasStepErrors: (stepId: PlanWizardStepId) => boolean;
};

export const useStepNavigation = (): UseStepNavigationResult => {
  const { trackEvent } = useForkliftAnalytics();
  const [currentStep, setCurrentStep] = useState<WizardStepType>(firstStep);
  const { hasStepErrors, validateStep } = useStepValidation();
  const initialStepTracked = useRef(false);

  useEffect(() => {
    if (!initialStepTracked.current) {
      initialStepTracked.current = true;
      trackEvent(TELEMETRY_EVENTS.PLAN_WIZARD_STEP_VISITED, {
        stepId: firstStep.id,
      });
    }
  }, [trackEvent]);

  const trackStepVisit = useCallback(
    (stepId: PlanWizardStepId): void => {
      trackEvent(TELEMETRY_EVENTS.PLAN_WIZARD_STEP_VISITED, {
        stepId,
      });
    },
    [trackEvent],
  );

  const handleStepChange: WizardProps['onStepChange'] = useCallback(
    async (_event: MouseEvent<HTMLButtonElement>, newStep: WizardStepType) => {
      const currentStepId = currentStep.id as PlanWizardStepId;
      const newStepId = newStep.id as PlanWizardStepId;

      if (currentStepId === newStepId) {
        return;
      }

      // Allow backward navigation without validation
      if (planStepOrder[newStepId] <= planStepOrder[currentStepId]) {
        setCurrentStep(newStep);
        trackStepVisit(newStepId);
        return;
      }

      try {
        const isCurrentStepValid = await validateStep(currentStepId);
        if (isCurrentStepValid) {
          setCurrentStep(newStep);
          trackStepVisit(newStepId);
        }
      } catch {
        // Stay on current step if validation throws
      }
    },
    [currentStep.id, trackStepVisit, validateStep],
  );

  return { currentStep, handleStepChange, hasStepErrors };
};
