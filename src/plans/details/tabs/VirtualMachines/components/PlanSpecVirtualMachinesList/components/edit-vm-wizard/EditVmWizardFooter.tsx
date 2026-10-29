import { type FC, useCallback, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { PlanModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useEditVmWizardSteps } from './hooks/useEditVmWizardSteps';
import { useEditVmWizardStepValidation } from './hooks/useEditVmWizardStepValidation';
import { buildEditVmPatchOperations } from './utils/buildEditVmPatchOperations';
import type { EditVmWizardStepId } from './constants';
import { useEditVmWizardContext } from './EditVmWizardContext';
import type { EditVmWizardFormValues } from './types';

type EditVmWizardFooterProps = {
  closeOverlay: () => void;
};

const EditVmWizardFooter: FC<EditVmWizardFooterProps> = ({ closeOverlay }) => {
  const { t } = useForkliftTranslation();
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const { control, getValues } = useFormContext<EditVmWizardFormValues>();
  const formValues = useWatch({ control });
  const {
    diskLoadError,
    isDiskInventoryLoading,
    plan,
    providerType,
    selectableDiskAddresses,
    vmIndex,
  } = useEditVmWizardContext();
  const stepIds = useEditVmWizardSteps(providerType);
  const { hasStepErrors, validateStep } = useEditVmWizardStepValidation({
    diskLoadError,
    isDiskInventoryLoading,
    plan,
    selectableDiskAddresses,
    vmIndex,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isFirstStep = activeStep.id === stepIds[0];
  const isLastStep = activeStep.id === stepIds[stepIds.length - 1];
  const activeStepId = activeStep.id as EditVmWizardStepId;

  const patchOperations = buildEditVmPatchOperations(
    plan,
    vmIndex,
    formValues as EditVmWizardFormValues,
  );
  const hasChanges = !isEmpty(patchOperations);

  const hasAnyStepErrors = stepIds.some((stepId) => hasStepErrors(stepId));
  const isNextDisabled =
    isSaving || hasStepErrors(activeStepId) || (isLastStep && (hasAnyStepErrors || !hasChanges));

  const onNextClick = useCallback(async () => {
    const stepsToValidate = isLastStep ? stepIds : [activeStepId];
    const results = await Promise.all(stepsToValidate.map(validateStep));
    if (results.includes(false)) {
      return;
    }

    if (isLastStep) {
      setSaveError(null);
      setIsSaving(true);
      try {
        const operations = buildEditVmPatchOperations(plan, vmIndex, getValues());
        if (!isEmpty(operations)) {
          await k8sPatch({
            data: operations,
            model: PlanModel,
            resource: plan,
          });
        }
        closeOverlay();
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : t('Unknown error'));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    await goToNextStep();
  }, [
    activeStepId,
    closeOverlay,
    getValues,
    goToNextStep,
    isLastStep,
    plan,
    stepIds,
    t,
    validateStep,
    vmIndex,
  ]);

  return (
    <WizardFooterWrapper>
      {saveError && <Alert isInline title={saveError} variant={AlertVariant.danger} />}
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              data-testid="edit-vm-wizard-back-button"
              isDisabled={isFirstStep || isSaving}
              onClick={goToPrevStep}
              variant={ButtonVariant.secondary}
            >
              {t('Back')}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button
              data-testid="edit-vm-wizard-next-button"
              isDisabled={isNextDisabled}
              isLoading={isSaving}
              onClick={onNextClick}
              variant={ButtonVariant.primary}
            >
              {isLastStep ? t('Save changes') : t('Next')}
            </Button>
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              data-testid="edit-vm-wizard-cancel-button"
              isDisabled={isSaving}
              onClick={closeOverlay}
              variant={ButtonVariant.link}
            >
              {t('Cancel')}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default EditVmWizardFooter;
