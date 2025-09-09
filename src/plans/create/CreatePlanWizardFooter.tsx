import { type FC, type MouseEvent, useCallback, useMemo } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { PlanModelRef } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  useWizardContext,
  type WizardFooterProps,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from './hooks/useCreatePlanFormContext';
import { useStepValidation } from './hooks/useStepValidation';
import { PlanWizardStepId } from './constants';
import type { CreatePlanFormData } from './types';

type CreatePlanWizardFooterProps = Partial<Pick<WizardFooterProps, 'nextButtonText' | 'onNext'>> & {
  hasError?: boolean;
};

const CreatePlanWizardFooter: FC<CreatePlanWizardFooterProps> = ({
  hasError = false,
  nextButtonText,
  onNext: onSubmit,
}) => {
  const navigate = useNavigate();
  const location: Location<CreatePlanFormData> = useLocation();
  const { t } = useForkliftTranslation();
  const [activeNamespace] = useActiveNamespace();
  const {
    formState: { isSubmitting },
  } = useCreatePlanFormContext();
  const { validateStep } = useStepValidation();
  const { activeStep, goToNextStep, goToPrevStep, goToStepById } = useWizardContext();

  const canSkipToReview = useMemo(
    () =>
      activeStep.id === PlanWizardStepId.MigrationType ||
      activeStep.id === PlanWizardStepId.OtherSettings,
    [activeStep.id],
  );

  const isBackDisabled = hasError || activeStep.id === PlanWizardStepId.General || isSubmitting;
  const isNextDisabled = hasError || isSubmitting;

  const onNextClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      if (onSubmit) return onSubmit(event);

      const isValid = await validateStep(activeStep.id as PlanWizardStepId);
      if (isValid) {
        await goToNextStep();
      }

      return undefined;
    },
    [onSubmit, validateStep, activeStep.id, goToNextStep],
  );

  const onSkipToReviewClick = useCallback(async () => {
    const isValid = await validateStep(activeStep.id as PlanWizardStepId);
    if (isValid) {
      goToStepById(PlanWizardStepId.ReviewAndCreate);
    }
  }, [validateStep, activeStep.id, goToStepById]);

  const onCancel = useCallback(() => {
    if (location.state?.sourceProvider) {
      navigate(-1);
      return;
    }

    const plansListUrl = getResourceUrl({
      namespace: activeNamespace,
      reference: PlanModelRef,
    });

    navigate(plansListUrl);
  }, [location.state?.sourceProvider, navigate, activeNamespace]);

  return (
    <WizardFooterWrapper>
      <Button
        data-testid="wizard-back-button"
        variant={ButtonVariant.secondary}
        onClick={goToPrevStep}
        isDisabled={isBackDisabled}
      >
        {t('Back')}
      </Button>
      <Button
        data-testid="wizard-next-button"
        variant={ButtonVariant.primary}
        onClick={onNextClick}
        isDisabled={isNextDisabled}
        isLoading={isSubmitting}
      >
        {nextButtonText ?? t('Next')}
      </Button>
      {canSkipToReview && (
        <Button
          data-testid="wizard-review-button"
          variant={ButtonVariant.tertiary}
          onClick={onSkipToReviewClick}
        >
          {t('Skip to review')}
        </Button>
      )}
      <Button
        data-testid="wizard-cancel-button"
        variant={ButtonVariant.secondary}
        onClick={onCancel}
      >
        {t('Cancel')}
      </Button>
    </WizardFooterWrapper>
  );
};

export default CreatePlanWizardFooter;
