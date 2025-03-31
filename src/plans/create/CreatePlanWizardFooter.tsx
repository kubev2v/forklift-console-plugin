import React, { type FC, type MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules';

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

import { PlanWizardStepId } from './constants';

type CreatePlanWizardFooterProps = Partial<Pick<WizardFooterProps, 'nextButtonText' | 'onNext'>>;

export const CreatePlanWizardFooter: FC<CreatePlanWizardFooterProps> = ({
  nextButtonText,
  onNext: onSubmit,
}) => {
  const history = useHistory();
  const { t } = useForkliftTranslation();
  const [activeNamespace] = useActiveNamespace();
  const { trigger } = useFormContext();
  const { activeStep, goToNextStep, goToPrevStep, goToStepById } = useWizardContext();
  const canSkipToReview =
    activeStep.id === PlanWizardStepId.MigrationType ||
    activeStep.id === PlanWizardStepId.OtherSettings;

  const onStepSubmit = async (event) => {
    if (onSubmit) {
      onSubmit(event);
      return;
    }

    return trigger(null, { shouldFocus: true });
  };

  const onNextClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const isValid = await onStepSubmit(event);

    if (isValid) {
      goToNextStep();
    }
  };

  const onSkipToReviewClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const isValid = await onStepSubmit(event);

    if (isValid) {
      goToStepById(PlanWizardStepId.ReviewAndCreate);
    }
  };

  const onCancel = () => {
    const plansListURL = getResourceUrl({
      namespace: activeNamespace,
      reference: PlanModelRef,
    });

    history.push(plansListURL);
  };

  return (
    <WizardFooterWrapper>
      <Button
        variant={ButtonVariant.secondary}
        onClick={goToPrevStep}
        isDisabled={activeStep.id === PlanWizardStepId.General}
      >
        {t('Back')}
      </Button>
      <Button variant={ButtonVariant.primary} onClick={onNextClick}>
        {nextButtonText || t('Next')}
      </Button>
      {canSkipToReview && (
        <Button variant={ButtonVariant.tertiary} onClick={onSkipToReviewClick}>
          {t('Skip to review')}
        </Button>
      )}
      <Button variant={ButtonVariant.link} onClick={onCancel}>
        {t('Cancel')}
      </Button>
    </WizardFooterWrapper>
  );
};

export default CreatePlanWizardFooter;
